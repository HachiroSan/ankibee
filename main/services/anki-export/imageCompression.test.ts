import { describe, it, expect } from 'vitest'
import path from 'path'
import { promises as fs } from 'fs'
import { compressAndWriteImage, isLikelyGif } from './imageCompression'
import sharp from 'sharp'

function fixturePath(name: string) {
	return path.join(process.cwd(), 'renderer', 'public', 'samples', name)
}

async function loadFixture(name: string): Promise<Buffer> {
	const p = fixturePath(name)
	return fs.readFile(p)
}

describe('imageCompression', () => {
	it('detects GIF header', async () => {
		const buf = await loadFixture('small.gif').catch(() => Buffer.from('GIF89a'))
		expect(isLikelyGif(buf)).toBe(true)
	})

	it('writes a compressed file smaller than input for opaque images', async () => {
		let input = await loadFixture('sample.jpg').catch(async () => {
			// Generate a large opaque test image if fixture not present
			return sharp({ create: { width: 2000, height: 1500, channels: 3, background: { r: 200, g: 150, b: 100 } } })
				.jpeg({ quality: 90 })
				.toBuffer()
		})
		const tmpBase = path.join(process.cwd(), '.tmp_test_opaque')
		const res = await compressAndWriteImage(input, tmpBase)
		const out = await fs.readFile(res.filePath)
		// Expect output to be strictly smaller than input
		expect(out.length).toBeLessThan(input.length)
		await fs.unlink(res.filePath).catch(() => {})
	})

	it('keeps GIF extension for GIF inputs', async () => {
		const gif = await loadFixture('small.gif').catch(() => Buffer.from('GIF89a'))
		const tmpBase = path.join(process.cwd(), '.tmp_test_gif')
		const res = await compressAndWriteImage(gif, tmpBase)
		expect(res.fileName.endsWith('.gif')).toBe(true)
		await fs.unlink(res.filePath).catch(() => {})
	})
})


