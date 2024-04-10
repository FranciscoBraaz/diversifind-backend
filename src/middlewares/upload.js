import multer from "multer"

export const upload = multer({
  dest: "./tmp",
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ]
    if (!allowedMimes.includes(file.mimetype)) {
      cb(new Error("Formato de arquivo inválido."))
      return
    }

    cb(null, true)
  },
})
