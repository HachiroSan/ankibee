import { describe, it, expect } from 'vitest'
import path from 'path'
import { promises as fs } from 'fs'
import { compressAndWriteImage } from './imageCompression'

// 1x1 transparent GIF (base64)
const ONE_BY_ONE_GIF_BASE64 = 'R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='

describe('GIF compression behaviour (A/B)', () => {
  it('given a GIF, when compression disabled, then output equals input and .gif is preserved', async () => {
    const input = Buffer.from(ONE_BY_ONE_GIF_BASE64, 'base64')
    const base = path.join(process.cwd(), '.tmp_bdd_gif_disabled')
    const res = await compressAndWriteImage(input, base, { enabled: false })
    expect(res.fileName.endsWith('.gif')).toBe(true)
    const out = await fs.readFile(res.filePath)
    expect(out.length).toBe(input.length)
    await fs.unlink(res.filePath).catch(() => {})
  })

  it('given a GIF, when compression enabled, then .gif is preserved and size does not increase', async () => {
    const input = Buffer.from(ONE_BY_ONE_GIF_BASE64, 'base64')
    const base = path.join(process.cwd(), '.tmp_bdd_gif_enabled')
    const res = await compressAndWriteImage(input, base, { enabled: true })
    expect(res.fileName.endsWith('.gif')).toBe(true)
    const out = await fs.readFile(res.filePath)
    // Allow equal or smaller; tiny GIFs may not compress further
    expect(out.length).toBeLessThanOrEqual(input.length)
    await fs.unlink(res.filePath).catch(() => {})
  })
})


