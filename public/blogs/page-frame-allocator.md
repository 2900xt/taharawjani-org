# Building a Page Frame Allocator: Memory Management in neo-OS

Memory management is the beating heart of any operating system. In neo-OS, I've implemented a sophisticated page frame allocator that transforms raw physical memory into a well-orchestrated system capable of efficiently handling memory requests from both kernel and user programs. 

This deep dive will take you through the fascinating world of memory management, from the hardware fundamentals to the elegant software abstractions that make modern computing possible.

---

## 🧠 Understanding Pages and Paging

### What is a Page?

Think of physical memory as a massive library, and **pages** as the standardized book format that makes everything manageable. A **page** is the fundamental unit of memory management in modern operating systems - exactly **4KB (4,096 bytes or 0x1000 hex)** in x86_64 architecture.

```text
Page Anatomy (4KB = 4096 bytes):
┌─────────────────────────────────────┐
│  Virtual Address: 0x7fff8000        │  ← Page-aligned (ends in 0x000)
├─────────────────────────────────────┤
│  Byte 0x000: [Data]                 │
│  Byte 0x001: [Data]                 │
│  ...                                │
│  Byte 0xFFE: [Data]                 │
│  Byte 0xFFF: [Data]                 │  ← Last byte in page
└─────────────────────────────────────┘
   4096 bytes total
```

This 4KB size isn't arbitrary - it's a carefully engineered sweet spot that balances multiple competing factors. The MMU can translate these addresses in just 1-2 CPU cycles, making memory access incredibly efficient. The size fits perfectly with modern CPU cache line sizes, optimizing cache performance. It's small enough to minimize wasted space from internal fragmentation, yet large enough to reduce the overhead of managing thousands of tiny allocations. Additionally, the Translation Lookaside Buffer can cache more translations when working with standardized 4KB pages.

---

### Virtual vs Physical Memory: The Great Illusion

One of the most elegant tricks in computer science is making every program think it owns the entire computer. This illusion is created through **virtual memory** - a sophisticated abstraction layer that separates what programs see from what actually exists in hardware.

![Virtual to Physical Memory Mapping](https://web.cs.ucla.edu/classes/fall08/cs111/scribe/4/virtual_mem.JPG)

Virtual memory provides several crucial benefits that make modern computing possible. Each process lives in its own virtual world, ensuring complete isolation where no program can accidentally corrupt another's memory. We can mark pages with specific protection flags - some read-only, others non-executable, or kernel-only for security. This system dramatically simplifies programming since every program can assume it starts at the same virtual address regardless of where it actually lives in physical RAM. Perhaps most cleverly, virtual memory enables overcommitment where we can promise more memory than physically exists, relying on swap files to handle the overflow.

---

### The x86_64 Page Table Hierarchy: A Four-Level Adventure

The magic happens through a sophisticated **4-level page table hierarchy** that breaks down every 64-bit virtual address into a treasure map leading to physical memory.

```text
x86_64 Virtual Address Breakdown (48-bit addressing):

 Bit Position: 63  48|47   39|38   30|29   21|20   12|11    0
              ┌──────┬──────┬──────┬──────┬──────┬──────┐
              │Unused│ PML4 │ PDP  │  PD  │  PT  │Offset│
              │16 bit│ 9bit │ 9bit │ 9bit │ 9bit │12bit │
              └──────┴──────┴──────┴──────┴──────┴──────┘
                      │      │      │      │      │
                      │      │      │      │      └─ Direct byte offset (0-4095)
                      │      │      │      └─ Page Table index (512 entries)
                      │      │      └─ Page Directory index (512 entries)  
                      │      └─ Page Directory Pointer index (512 entries)
                      └─ Page Map Level 4 index (512 entries)
```

**Translation Journey:**

![Address Translation Journey](https://miro.medium.com/v2/resize:fit:884/1*tfRfH1cTLe5yTaMjaq4QRA.png)

**Memory Coverage at Each Level:**

| Level | Entries | Memory Per Entry | Total Coverage |
|-------|---------|------------------|----------------|
| PML4  | 512     | 512 GB          | 256 TB         |
| PDP   | 512     | 1 GB            | 512 GB         |
| PD    | 512     | 2 MB            | 1 GB           |
| PT    | 512     | 4 KB            | 2 MB           |

---

### Memory Management Unit (MMU): The Hardware Wizard

The MMU is like a hyper-intelligent GPS system that instantly translates every memory address your programs use. It's performing millions of translations per second, and when it can't find a route, it throws a tantrum (page fault) that the OS has to handle.

![MMU Address Translation Process](https://cdn.prod.website-files.com/67615512eed3697e5e735df6/67c9b476f3be10b069ac704b_KdQFc7OFQDeBANYrl2ff.png)
The performance characteristics of memory translation vary dramatically depending on what happens during the lookup. A TLB hit is lightning fast at 0-1 cycles, but a TLB miss becomes expensive at 100+ cycles as the MMU must walk the page tables. Page faults are catastrophic at 1000+ cycles since they require kernel intervention.

Page faults can be triggered by several scenarios: accessing memory that's been swapped out to disk, attempting to write to read-only memory, user code trying to access kernel-only memory, or attempting to execute code from data pages when the NX (No eXecute) bit is set.

![Page Fault Handling Flow](https://images.saymedia-content.com/.image/ar_4:3%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:eco%2Cw_1200/MTczOTIyMzk3NzQzNzUzMDU3/what-is-page-fault-in-nonpaged-area.jpg)

---

## Page Frame Allocator Implementation

Now that we understand the theoretical foundation, let's dive into the actual implementation of our page frame allocator. This is where theory meets reality, and elegant algorithms manage the chaos of real-world memory allocation.

### Core Data Structures

Our allocator uses three key structures that work together to track every byte of physical memory:

```cpp
enum MEMORY_TYPES : uint8_t {
    FREE = 0x0,            // Available for allocation
    RESERVED = 0x1,        // System reserved, never allocate
    ACPI_RECLAIMABLE = 0x2,// Can be reclaimed after ACPI init
    ACPI_NVS = 0x3,        // ACPI tables - never reclaim
    BAD_MEMORY = 0x4,      // Marked bad by firmware
    BOOTLOADER_RECLAIMABLE = 0x5, // Used by bootloader, can reclaim
    KERNEL_MAPPED = 0x6,    // Used by kernel static mapping
    FRAMEBUFFER = 0x7,     // Graphics framebuffer
    DMA = 0x8,             // DMA-accessible memory
    SWAPPED = 0x9,         // Currently swapped to disk
    USED = 0xA,            // Allocated and in use
};

struct memory_segment_t {
    uint64_t start;        // Physical start address
    size_t size;           // Size in pages (not bytes!)
    MEMORY_TYPES type;     // Current usage type
};

struct page_list_entry_t {
    memory_segment_t memory;
    page_list_entry_t* prev;  // Previous in linked list
    page_list_entry_t* next;  // Next in linked list
};
```

Each field serves a specific purpose in our memory tracking system. The `start` address must be page-aligned, always ending in 0x000 to maintain proper boundaries. We store `size` in pages rather than bytes to avoid overflow issues when dealing with large memory regions. The `type` field guides allocation decisions and helps the memory manager understand how each region should be handled. Finally, the `prev` and `next` pointers enable efficient list traversal and region merging operations.

### Initialization Process

The initialization phase is critical - it sets up our memory map from the bootloader's information:

```cpp
void initialize_page_allocator() {
    acquire_spinlock();  // Ensure thread safety
    
    for (auto& region : limine_memory_map) {
        // Create new tracking entry
        page_list_entry_t* new_entry = create_entry();
        
        // Convert byte counts to page counts
        new_entry->memory.size = region.length / PAGE_SIZE;
        
        // Preserve physical address
        new_entry->memory.start = region.base;
        
        // Map bootloader types to our types
        new_entry->memory.type = convert_type(region.type);
        
        // Insert maintaining address order
        link_into_list(new_entry);
    }
    
    release_spinlock();
}
```

This initialization code handles several critical tasks during system startup. It converts the bootloader's byte-granular memory regions into page-granular tracking structures that align with our page-based allocation system. The code maintains physical address ordering in the linked list to enable efficient searching and merging operations. It carefully preserves the bootloader's type information about special memory regions like ACPI tables and hardware buffers. Finally, it ensures thread safety for multi-processor systems through proper spinlock usage.

### Allocation Strategy

The allocator uses a first-fit strategy with intelligent splitting:

```cpp
void* allocate_pages(size_t requested_count) {
    acquire_spinlock();
    
    for (auto* entry = page_list_head; entry; entry = entry->next) {
        // Skip non-free regions
        if (entry->memory.type != FREE) continue;
        
        // Exact size match
        if (entry->memory.size == requested_count) {
            entry->memory.type = USED;
            release_spinlock();
            return (void*)entry->memory.start;
        }
        
        // Large enough to split
        if (entry->memory.size > requested_count) {
            // Create new entry for remainder
            split_region(entry, requested_count);
            release_spinlock();
            return (void*)entry->memory.start;
        }
    }
    
    release_spinlock();
    return nullptr; // Out of memory
}
```

The splitting logic is particularly interesting:

```cpp
void split_region(page_list_entry_t* entry, size_t pages_needed) {
    // Calculate addresses carefully
    uint64_t split_start = entry->memory.start + 
                          (pages_needed * PAGE_SIZE);
    
    // Create entry for remainder
    page_list_entry_t* remainder = create_entry();
    remainder->memory.start = split_start;
    remainder->memory.size = entry->memory.size - pages_needed;
    remainder->memory.type = FREE;
    
    // Update original entry
    entry->memory.size = pages_needed;
    entry->memory.type = USED;
    
    // Link into list
    remainder->next = entry->next;
    remainder->prev = entry;
    if (entry->next) entry->next->prev = remainder;
    entry->next = remainder;
}
```

This splitting implementation carefully handles several important details. It maintains page alignment for all addresses to ensure compatibility with the MMU's requirements. The code preserves the linked list ordering to enable efficient traversal and searching. It properly handles edge cases like splitting the last entry in the list or dealing with exact size matches. Most importantly, it minimizes fragmentation by creating the smallest possible remainder regions.

### Deallocation and Coalescing

The deallocation process includes sophisticated coalescing to prevent fragmentation:

```cpp
void free_pages(void* page_address) {
    acquire_spinlock();
    
    // Find entry containing this address
    page_list_entry_t* entry = find_entry_by_address(page_address);
    assert(entry && entry->memory.type == USED);
    
    // Mark as free
    entry->memory.type = FREE;
    
    // Try to coalesce with neighbors
    if (entry->prev && entry->prev->memory.type == FREE) {
        combine_segments(entry->prev, entry);
        entry = entry->prev; // Update for next coalesce
    }
    if (entry->next && entry->next->memory.type == FREE) {
        combine_segments(entry, entry->next);
    }
    
    release_spinlock();
}

void combine_segments(page_list_entry_t* first, page_list_entry_t* second) {
    // Add sizes
    first->memory.size += second->memory.size;
    
    // Fix links
    first->next = second->next;
    if (second->next) {
        second->next->prev = first;
    }
    
    // Clean up
    delete second;
}
```

The coalescing process handles memory defragmentation intelligently by checking both adjacent segments for potential merging opportunities. It only combines segments that are marked as FREE to avoid corrupting allocated memory. The process carefully maintains linked list integrity during merging operations and properly handles memory cleanup by deallocating the redundant tracking structures.

### Performance Characteristics

The implementation balances simplicity with efficiency:

*n = number of segments*

| Operation  | Time Complexity | Space Complexity | 
|------------|------------------------|-----------|
| Allocation | O(n)                   | O(1)      |
| Free       | O(n) find + O(1) merge | O(1)      |
| Split      | O(1)                   | O(1)      |
| Coalesce   | O(1)                   | O(1)      | 

The memory overhead of this allocator design is quite reasonable. We maintain one `page_list_entry_t` structure per contiguous memory region rather than tracking individual pages, which dramatically reduces overhead. There's no per-page tracking overhead, and the total overhead actually decreases over time as coalescing operations merge adjacent free regions together.

### Integration with Virtual Memory

The page frame allocator integrates seamlessly with the virtual memory system:

```cpp
// Example: Mapping a new page for a process
void* map_new_page(void* virtual_addr, uint32_t flags) {
    // Get physical frame
    void* frame = allocate_pages(1);
    if (!frame) return nullptr;
    
    // Map it into virtual address space
    if (!map_page(virtual_addr, frame, flags)) {
        free_pages(frame);
        return nullptr;
    }
    
    return virtual_addr;
}
```

This integration demonstrates how the page frame allocator seamlessly supports the virtual memory system. It provides physical frames for page table structures, gracefully handles out-of-memory conditions by returning null pointers that the virtual memory system can handle appropriately, maintains memory protection by working with the MMU's page-based protection model, and enables advanced features like copy-on-write by providing the underlying physical memory management.

## Conclusion

The complete source code can be found in [`OS/src/kernel/mem/paging/page_allocator.cpp`](https://github.com/2900xt/neo-OS/blob/trunk/OS/src/kernel/mem/paging/page_allocator.cpp). 