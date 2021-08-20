import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (
      req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void) => {
    cb(null, './tmp/uploads');
  },
  filename: (
      req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const imageFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: null, acceptFile: boolean) => void) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const uploadSingleImage =
  multer({storage: storage, fileFilter: imageFilter})
      .single('image');

export const uploadCSVFile =
  multer({storage: storage})
      .single('csv');
