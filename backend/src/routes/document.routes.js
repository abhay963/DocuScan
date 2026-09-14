import express from "express";
import multer from "multer";

import {
    processDocument
} from "../services/document.service.js";


const router =
    express.Router();


/*
|--------------------------------------------------------------------------
| Multer Configuration
|--------------------------------------------------------------------------
*/

const upload =
    multer({

        storage:
            multer.memoryStorage(),

        limits: {

            // 10 MB maximum
            fileSize:
                10 * 1024 * 1024

        },

        fileFilter:
            (req, file, cb) => {

                if (
                    file.mimetype ===
                    "application/pdf"
                ) {

                    cb(
                        null,
                        true
                    );

                } else {

                    cb(
                        new Error(
                            "Only PDF files are allowed"
                        )
                    );

                }

            }

    });


/*
|--------------------------------------------------------------------------
| POST /api/v1/documents
|--------------------------------------------------------------------------
|
| Form-data:
|
| file -> PDF
|
|--------------------------------------------------------------------------
*/

router.post(
    "/",

    upload.single(
        "file"
    ),

    async (
        req,
        res
    ) => {

        try {

            /*
            |--------------------------------------------------------------------------
            | Validate file
            |--------------------------------------------------------------------------
            */

            if (
                !req.file
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "PDF file is required"

                    });

            }


            console.log(
                "\n========================================"
            );

            console.log(
                "DOCUMENT PROCESSING STARTED"
            );

            console.log(
                "========================================"
            );


            console.log(
                `File: ${req.file.originalname}`
            );

            console.log(
                `Size: ${req.file.size} bytes`
            );


            /*
            |--------------------------------------------------------------------------
            | Process document
            |--------------------------------------------------------------------------
            */

            const result =
                await processDocument(
                    req.file.buffer,
                    req.file.originalname
                );


            /*
            |--------------------------------------------------------------------------
            | Success response
            |--------------------------------------------------------------------------
            */

            return res
                .status(200)
                .json({

                    success: true,

                    document: {

                        fileName:
                            req.file.originalname,

                        mimeType:
                            req.file.mimetype,

                        size:
                            req.file.size,

                        pageCount:
                            result.pageCount

                    },

                    extraction: {

                        source:
                            result.source,

                        textLength:
                            result.text.length

                    },

                    entities:
                        result.entities

                });


        } catch (error) {

            console.error(
                "\nDocument processing failed:"
            );

            console.error(
                error
            );


            /*
            |--------------------------------------------------------------------------
            | Multer file-size error
            |--------------------------------------------------------------------------
            */

            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res
                    .status(413)
                    .json({

                        success: false,

                        message:
                            "PDF size cannot exceed 10 MB"

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | File type error
            |--------------------------------------------------------------------------
            */

            if (
                error.message ===
                "Only PDF files are allowed"
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            error.message

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | Generic error
            |--------------------------------------------------------------------------
            */

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Failed to process document",

                    error:
                        process.env.NODE_ENV ===
                        "development"
                            ? error.message
                            : undefined

                });

        }

    }
);


export default router;