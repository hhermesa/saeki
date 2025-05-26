import { Router } from "express";
import {v4 as uuidv4} from "uuid";
import axios from "axios";
import multer from "multer";

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ['.step', '.STEP', '.iges', '.IGES', '.pdf', '.PDF'];
        const ext = file.originalname.slice(file.originalname.lastIndexOf('.'));
        cb(null, allowed.includes(ext));
    }
});

router.post(
    '/',
    upload.array('file'),
    async (req, res) => {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            res.status(400).json({ error: 'No files uploaded. Use field "file"' });
            return;
        }

        const zone      = process.env.BUNNY_STORAGE_ZONE!;
        const apiKey    = process.env.BUNNY_API_KEY!;
        const pullHost  = process.env.BUNNY_PULL_ZONE!;

        try {
            const results = await Promise.all(
                files.map(async (file) => {
                    const safeName = file.originalname.replace(/\s+/g, '_');
                    const filename =
                        `${Date.now()}-${uuidv4()}-${safeName}`;

                    await axios.put(
                        `https://storage.bunnycdn.com/${zone}/${filename}`,
                        file.buffer,
                        {
                            headers: {
                                AccessKey: apiKey,
                                'Content-Type': file.mimetype,
                            },
                            maxBodyLength: Infinity,
                        }
                    );

                    return {
                        originalName: file.originalname,
                        mimeType:    file.mimetype,
                        size:        file.size,
                        fileUrl:     `https://${pullHost}/${filename}`,
                    };
                })
            );

            res.json(results);
        } catch (err: any) {
            console.error('Bunny upload error:', err);
            res.status(500).json({ error: 'Failed to upload to BunnyCDN' });
        }
    }
);

export default router;
