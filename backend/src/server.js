import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import documentRoutes from "./routes/document.routes.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(
    express.json()
);


/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get(
    "/",
    (req, res) => {

        res.json({
            success: true,
            message: "DocuScan OCR API is running"
        });

    }
);


/*
|--------------------------------------------------------------------------
| Document API
|--------------------------------------------------------------------------
*/

app.use(
    "/api/v1/documents",
    documentRoutes
);


/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use(
    (err, req, res, next) => {

        console.error(
            "Unhandled error:",
            err
        );

        res.status(
            err.status || 500
        ).json({

            success: false,

            message:
                err.message ||
                "Internal server error"

        });

    }
);


/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    }
);