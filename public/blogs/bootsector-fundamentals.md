# Crafting a Basic Bootsector: Your First Step into OS Development

The journey of every operating system begins with a single, magical 512-byte program called a **bootsector**. This tiny piece of code is the first thing that runs when your computer powers on, bridging the gap between firmware and your operating system kernel. It's where hardware meets software, where the CPU takes its first tentative steps into the world you've created.

In this article, we'll demystify the bootsector, explore the ancient art of BIOS programming, and walk through my implementation of a basic bootsector that can load and execute additional code from disk.

---

## 🚀 The Boot Process: From Power-On to Your Code

### Understanding the Journey

When you press that power button, an intricate dance begins between hardware and software. Let's trace this journey from the very beginning:

![Boot Process Flow](/bootProcess.png)

When you press the power button, the CPU immediately begins executing code at physical address `0xFFFF0`, which is about 16MB into memory. This leads to the BIOS or UEFI firmware, which takes control and initializes all the hardware components while performing the Power-On Self-Test (POST) to ensure everything is working correctly.

Next, the BIOS searches for bootable devices according to your boot priority settings - it might check the hard drive first, then USB devices, then optical drives. When it finds a potentially bootable device, it loads the very first 512 bytes from that device into memory at address `0x7C00`. 

Here's where the magic happens: if those final two bytes (510-511) contain the special signature `0x55AA`, the BIOS knows this is valid bootable code and transfers control to address `0x7C00` where your bootsector begins execution.

This handoff at `0x7C00` is where **your code** begins to run. No operating system, no runtime library, no safety net - just you, the CPU, and 512 bytes of pure possibility.

---

### Why 0x7C00? A Historical Quirk

The address `0x7C00` isn't arbitrary - it's a fascinating artifact of computing history. When IBM designed the original PC, they carefully chose this address to avoid conflicts with existing system components. They needed to leave room for the interrupt vector table at the very bottom of memory (0x0000-0x03FF), followed by the BIOS data area (0x0400-0x04FF). The address also had to avoid conventional memory areas used by video buffers and other system components, while still providing reasonable stack space that could grow downward from the bootloader's location.

```text
Real Mode Memory Layout (First 64KB):
┌─────────────────────────────────────┐ 0xFFFF
│         High Memory Area            │
├─────────────────────────────────────┤ 0x9FC00
│         Stack Space                 │
├─────────────────────────────────────┤ 0x7E00
│     Bootloader Code (512 bytes)     │ ← 0x7C00 (Your code here!)
├─────────────────────────────────────┤ 0x7C00
│         Free Memory                 │
├─────────────────────────────────────┤ 0x0500
│         BIOS Data Area              │
├─────────────────────────────────────┤ 0x0400
│      Interrupt Vector Table         │
└─────────────────────────────────────┘ 0x0000
```

---

## 🔧 BIOS Interrupts: Your Gateway to Hardware

### The Ancient API

In the early days of computing, before sophisticated APIs and drivers, programmers communicated with hardware through **BIOS interrupts** - a system of software-triggered function calls that let you access keyboard input, display output, disk operations, and more.

For bootloader development, you'll primarily work with just a handful of these interrupts. `INT 0x10` handles all video services, letting you output text to the screen and control the cursor. `INT 0x13` is your gateway to disk operations - reading and writing sectors, getting drive information, and more. `INT 0x16` gives you keyboard input capabilities, while `INT 0x15` helps with memory services like getting the system memory map and accessing extended memory beyond the first megabyte.

### INT 0x13: The Disk Whisperer

The most crucial interrupt for bootloaders is `INT 0x13` - your gateway to reading additional code from storage devices:

```asm
; INT 0x13, AH=0x02 - Read Disk Sectors
; Input:
;   AH = 0x02 (function: read sectors)
;   AL = Number of sectors to read (1-128)
;   CH = Cylinder number (0-1023)
;   CL = Sector number (1-63)
;   DH = Head number (0-255)
;   DL = Drive number (0x00=floppy, 0x80=hard disk)
;   ES:BX = Buffer address to store read data
; Output:
;   CF = 0 if successful, 1 if error
;   AH = Error code (if CF=1)
;   AL = Number of sectors actually read
```

### Addressing the Mysteries of CHS

Old BIOS systems use **CHS (Cylinder-Head-Sector)** addressing - a relic from the days when hard drives were literally cylindrical:

![CHS Addressing Diagram](https://cdn.savemyexams.com/uploads/2023/04/3-3-data-storage-secondary-storage-2-1.png)

Understanding CHS addressing requires thinking about how old hard drives were physically constructed. A cylinder represents the concentric circular tracks on the disk surface - imagine looking down at a record player and seeing all those circular grooves. The head refers to the physical read/write head that moves across the disk surface, with one head for each disk surface (top and bottom). Finally, each track is divided into sectors, which are the smallest addressable units, typically 512 bytes each.

---

## 💻 My Bootsector Implementation

Let's examine each section of this bootsector implementation:

#### 1. **Origin and Memory Layout**

```asm
[org 0x7c00]
PROGRAM_SPACE equ 0x8000
```

- `[org 0x7c00]`: Tells assembler our code will be loaded at address 0x7C00
- `PROGRAM_SPACE equ 0x8000`: Defines where we'll load additional code for our second stage (32KB mark)


#### 2. **Stack Setup**

```asm
mov bp, 0x7c00
mov sp, bp
```

This creates a stack that grows downward from 0x7C00, which is perfect for our needs. Since the stack grows downward and our code is loaded at 0x7C00, we ensure the stack will never overwrite our bootloader code. We also get plenty of stack space for function calls and nested operations, while maintaining a simple and predictable memory layout that's easy to debug.

#### 3. **Disk Reading Operation**

```asm
mov bx, PROGRAM_SPACE     ; Destination: 0x8000
mov al, 64                ; Read 64 sectors (32KB)
mov ch, 0x00              ; Cylinder 0
mov dh, 0x00              ; Head 0
mov cl, 0x02              ; Sector 2 (skip bootsector)
call discRead
```

This reads 64 sectors (32KB) starting from sector 2, giving us plenty of space for a second-stage bootloader or small kernel.

#### 4. **Error Handling Strategy**

```asm
discRead:
    mov ah, 0x02
    int 0x13
    jc DiskReadFailed         ; Check carry flag for errors
    ret

DiskReadFailed:
    mov bx, DiskReadErrorString
    call PrintStr
    jmp $                     ; Halt with infinite loop
```

The carry flag indicates whether the BIOS operation succeeded or failed - it's set to 1 if something went wrong. Our error handling approach is straightforward but effective: we display a human-readable error message so the user knows what happened, then halt execution gracefully with an infinite loop rather than letting the CPU continue with potentially corrupted data.

#### 5. **Text Output System**

```asm
PrintStr:
    mov ah, 0x0e              ; BIOS teletype function
    .loop:
        cmp [bx], byte 0      ; Null terminator check
        je .exit
        call PrintChar
        inc bx
        jmp .loop
    .exit:
        ret
```

This code sets up a simple way for the bootloader to print text to the screen using BIOS interrupt 0x10, function 0x0E (the teletype output). The `PrintStr` routine takes a pointer to a string, loops through each character until it finds a null terminator, and prints each character one by one using the BIOS. This lets the bootloader display messages or errors directly to the user, even before any operating system is loaded.

---

## 🛡️ The Boot Signature: 0xAA55

### The Magic Bytes

Every valid bootsector must end with the 16-bit signature `0xAA55` (stored as `0x55AA` in little-endian format):

```asm
times 510-($-$$) db 0     ; Pad to 510 bytes with zeros
dw 0xaa55                 ; Boot signature
```

This signature serves multiple critical purposes in the boot process. The BIOS uses these magic bytes to identify bootable media - without them, your device won't even be considered during the boot sequence. The signature also enforces that your bootsector is exactly 512 bytes, and provides a simple corruption detection mechanism since disk read errors often result in garbage data that won't end with the correct signature.

This standard was established with the original IBM PC and has remained unchanged for decades. If your bootsector doesn't end with 0xAA55, the BIOS will simply skip your device during the boot sequence, the system will display "No bootable device found," and your carefully crafted bootloader will never get a chance to run.

---

## 🚀 Building and Testing

### Assembly and Deployment

To build this bootsector, you'll need NASM (Netwide Assembler):

```bash
# Assemble the bootsector
nasm -f bin bootsector.asm -o bootsector.bin

# Verify it's exactly 512 bytes
ls -l bootsector.bin

# Write to USB drive (CAREFUL! Replace /dev/sdX with your device)
sudo dd if=bootsector.bin of=/dev/sdX bs=512 count=1

# For virtual testing with QEMU
qemu-system-x86_64 -drive file=bootsector.bin,format=raw
```

### Testing Strategy

![QEMU Testing Environment](/neoOSPreview.png)

Virtual machine testing with tools like QEMU is invaluable during development because it's completely safe - there's no risk of damaging real hardware or corrupting your main system. You can iterate quickly, easily attach debuggers, and monitor CPU state in ways that would be difficult or impossible on real hardware.

However, real hardware testing remains important for final validation. Real hardware gives you true timing characteristics, authentic BIOS behavior with all its quirks, and serves as the ultimate test of correctness. Some subtle bugs only appear when running on actual hardware due to timing differences or BIOS implementation variations.

---

## 🎯 Next Steps: Beyond the Bootsector

### Second-Stage Bootloader

Your bootsector is just the beginning! The 512-byte limit means you'll need a second-stage bootloader for complex tasks:

```text
Boot Process Evolution:
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Bootsector    │───▶│  Second Stage    │───▶│     Kernel      │
│   (512 bytes)   │    │   (unlimited)    │    │  (your OS!)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
     • Stack setup         • Enable A20 line      • Memory management
     • Load stage 2         • Switch to protected  • Process scheduling
     • Basic disk I/O       • Set up GDT/IDT      • Device drivers
     • Error handling       • Load kernel          • File systems
```

### Advanced Features to Implement

As you advance beyond basic bootsectors, you'll want to tackle memory management challenges like enabling the A20 line for full memory access, setting up protected mode for 32-bit operations, and implementing proper memory detection routines.

Storage system improvements might include supporting multiple file systems like FAT32 or ext2, implementing LBA addressing for modern drives instead of the ancient CHS system, and adding support for booting from CD-ROMs and USB devices.

Eventually, you may want to embrace modern boot standards by adding UEFI compatibility, implementing Secure Boot support, and handling GPT partition tables instead of the traditional MBR approach.

---

The complete source code can be found in T-Dos (old version of Neo-OS) at [`T-Dos/boot/boot.asm`](https://github.com/2900xt/T-dos/blob/main/T-DOS/boot/boot.asm). 