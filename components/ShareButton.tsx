"use client"

export default function ShareButton() {
  const handleShareBlog = async () => {
    const currentUrl = window.location.href
    try {
      await navigator.clipboard.writeText(currentUrl)
      alert('Blog URL copied to clipboard!')
    } catch (err) {
      alert(`Share this blog: ${currentUrl}`)
    }
  }

  return (
    <button
      style={{
        padding: '5px 10px',
        background: '#007acc',
        color: 'white',
        border: 'none',
        cursor: 'pointer'
      }}
      onClick={handleShareBlog}
    >
      📋 Share
    </button>
  );
}
