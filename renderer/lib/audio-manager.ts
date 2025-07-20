// Global audio manager to prevent multiple audio files from playing simultaneously
class AudioManager {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private urlCache = new Map<string, string>(); // Cache URLs for repeated audio data

  play(audioData: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop any currently playing audio
      this.stop();

      // Create a hash of the audio data for caching
      const audioHash = this.hashArrayBuffer(audioData);
      
      // Check if we have a cached URL for this audio data
      let audioUrl = this.urlCache.get(audioHash);
      
      if (!audioUrl) {
        // Create new URL if not cached
        const audioBlob = new Blob([audioData], { type: 'audio/mp3' });
        audioUrl = URL.createObjectURL(audioBlob);
        this.urlCache.set(audioHash, audioUrl);
      }
      
      const audio = new Audio(audioUrl);

      this.currentAudio = audio;
      this.currentUrl = audioUrl;

      audio.onended = () => {
        this.cleanup();
        resolve();
      };

      audio.onerror = (error) => {
        this.cleanup();
        reject(error);
      };

      audio.onpause = () => {
        // Only resolve if the audio was paused by user action, not when ended
        if (this.currentAudio && !this.currentAudio.ended) {
          this.cleanup();
          resolve();
        }
      };

      audio.play().catch(reject);
    });
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.cleanup();
    }
  }

  private cleanup(): void {
    if (this.currentUrl) {
      // Don't revoke URL immediately as it might be cached
      this.currentUrl = null;
    }
    this.currentAudio = null;
  }

  // Method to clear cache when needed (e.g., on app shutdown)
  clearCache(): void {
    this.urlCache.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    this.urlCache.clear();
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  private hashArrayBuffer(buffer: ArrayBuffer): string {
    // Simple hash function for ArrayBuffer
    let hash = 0;
    const uint8Array = new Uint8Array(buffer);
    for (let i = 0; i < Math.min(uint8Array.length, 1000); i++) {
      hash = ((hash << 5) - hash) + uint8Array[i];
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}

// Export singleton instance
export const audioManager = new AudioManager(); 