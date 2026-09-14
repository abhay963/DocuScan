import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiCode,
  FiCopy,
  FiDatabase,
  FiDownload,
  FiFileText,
  FiLayers,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUploadCloud,
  FiX,
  FiZap,
} from "react-icons/fi";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const MAX_FILE_SIZE =
  10 * 1024 * 1024;


/* =====================================================
   PROCESSING STAGES
===================================================== */

const PROCESSING_STAGES = [
  {
    name: "Uploading",
    description: "Receiving your PDF",
    icon: FiUploadCloud,
  },
  {
    name: "Processing",
    description: "Reading document",
    icon: FiLayers,
  },
  {
    name: "Extracting",
    description: "Finding entities",
    icon: FiSearch,
  },
  {
    name: "Validating",
    description: "Checking response",
    icon: FiShield,
  },
  {
    name: "Completed",
    description: "Data is ready",
    icon: FiCheckCircle,
  },
];


/* =====================================================
   MOTION
===================================================== */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 18,
  },

  visible: {
    opacity: 1,
    y: 0,
  },
};


const stagger = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.045,
    },
  },
};


/* =====================================================
   ENTITY CARD
===================================================== */

function EntityCard({
  entity,
  index,
}) {

  const confidence =
    typeof entity.confidence === "number"
      ? Math.round(entity.confidence * 100)
      : null;


  return (
    <motion.div
      variants={fadeUp}
      whileHover={{
        y: -4,
      }}
      transition={{
        duration: 0.2,
      }}
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border border-slate-200
        bg-white
        p-5
        shadow-[0_8px_30px_rgba(15,23,42,0.04)]
        hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]
      "
    >

      <div
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-24
          w-24
          rounded-full
          bg-blue-100
          opacity-0
          blur-2xl
          transition-opacity
          group-hover:opacity-70
        "
      />


      <div className="relative">

        {/* Header */}

        <div className="flex items-center justify-between gap-3">

          <div
            className="
              flex
              min-w-0
              items-center
              gap-2.5
            "
          >

            <div
              className="
                flex
                h-9
                w-9
                flex-shrink-0
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-blue-600
              "
            >
              <FiZap size={15} />
            </div>


            <div className="min-w-0">

              <p
                className="
                  truncate
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-blue-600
                "
              >
                {entity.type || "ENTITY"}
              </p>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  text-slate-400
                "
              >
                Entity #{index + 1}
              </p>

            </div>

          </div>


          {entity.page && (
            <span
              className="
                rounded-full
                bg-slate-100
                px-2.5
                py-1
                text-[9px]
                font-bold
                text-slate-500
              "
            >
              Page {entity.page}
            </span>
          )}

        </div>


        {/* Value */}

        <p
          className="
            mt-5
            break-words
            text-sm
            font-bold
            leading-6
            text-slate-900
          "
        >
          {entity.value || "—"}
        </p>


        {/* Confidence */}

        {confidence !== null && (
          <div className="mt-5">

            <div
              className="
                flex
                items-center
                justify-between
                text-[9px]
                font-bold
              "
            >

              <span className="text-slate-400">
                Confidence
              </span>

              <span className="text-emerald-600">
                {confidence}%
              </span>

            </div>


            <div
              className="
                mt-2
                h-1.5
                overflow-hidden
                rounded-full
                bg-slate-100
              "
            >

              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${confidence}%`,
                }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.02,
                }}
                className="
                  h-full
                  rounded-full
                  bg-emerald-500
                "
              />

            </div>

          </div>
        )}

      </div>

    </motion.div>
  );
}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  label,
  value,
  icon: Icon,
}) {

  return (
    <motion.div
      variants={fadeUp}
      className="
        rounded-2xl
        border border-slate-200
        bg-white
        p-5
      "
    >

      <div className="flex items-center gap-2">

        <div
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            bg-blue-50
            text-blue-600
          "
        >
          <Icon size={14} />
        </div>

        <p
          className="
            text-[9px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-slate-400
          "
        >
          {label}
        </p>

      </div>


      <p
        className="
          mt-3
          text-2xl
          font-black
          text-slate-950
        "
      >
        {value}
      </p>

    </motion.div>
  );
}


/* =====================================================
   MAIN APP
===================================================== */

function App() {

  const reduceMotion =
    useReducedMotion();


  const [selectedFile, setSelectedFile] =
    useState(null);


  const [loading, setLoading] =
    useState(false);


  const [processingStage, setProcessingStage] =
    useState("");


  // Fake chunk progress for UI while the backend processes the PDF.
  const [chunkProgress, setChunkProgress] = useState(0);

  const chunkTimerRef = useRef(null);


  const [result, setResult] =
    useState(null);


  const [error, setError] =
    useState(null);


  const [copied, setCopied] =
    useState(false);


  const [dragOver, setDragOver] =
    useState(false);


  const fileInputRef =
    useRef(null);


  const stageTimersRef =
    useRef([]);


  /* =====================================================
     CLEANUP
  ===================================================== */

  useEffect(() => {

    return () => {

      stageTimersRef.current.forEach(
        clearTimeout
      );

      if (chunkTimerRef.current) {
        clearInterval(chunkTimerRef.current);
      }

    };

  }, []);


  /* =====================================================
     FILE SELECT
  ===================================================== */

  const handleFileSelect =
    useCallback((file) => {

      if (!file) {
        return;
      }


      const isPdf =
        file.type === "application/pdf" ||
        file.name
          .toLowerCase()
          .endsWith(".pdf");


      if (!isPdf) {

        setError(
          "Only PDF files are allowed."
        );

        return;
      }


      if (
        file.size >
        MAX_FILE_SIZE
      ) {

        setError(
          "File size exceeds the 10 MB limit."
        );

        return;
      }


      setSelectedFile(file);

      setResult(null);

      setError(null);

      setCopied(false);

    }, []);


  /* =====================================================
     INPUT CHANGE
  ===================================================== */

  const handleInputChange =
    useCallback((event) => {

      const file =
        event.target.files?.[0];


      if (file) {

        handleFileSelect(file);

      }

    }, [handleFileSelect]);


  /* =====================================================
     DROP
  ===================================================== */

  const handleDrop =
    useCallback((event) => {

      event.preventDefault();

      setDragOver(false);


      const file =
        event.dataTransfer
          .files?.[0];


      if (file) {

        handleFileSelect(file);

      }

    }, [handleFileSelect]);


  /* =====================================================
     REMOVE
  ===================================================== */

  const removeFile =
    useCallback(() => {

      setSelectedFile(null);

      setResult(null);

      setError(null);

      setProcessingStage("");

      setCopied(false);


      stageTimersRef.current.forEach(
        clearTimeout
      );


      stageTimersRef.current = [];

      if (chunkTimerRef.current) {
        clearInterval(chunkTimerRef.current);
        chunkTimerRef.current = null;
      }

      setChunkProgress(0);


      if (fileInputRef.current) {

        fileInputRef.current.value = "";

      }

    }, []);


  /* =====================================================
     FILE SIZE
  ===================================================== */

  const formatFileSize =
    useCallback((bytes) => {

      if (!bytes) {
        return "0 Bytes";
      }


      const units = [
        "Bytes",
        "KB",
        "MB",
        "GB",
      ];


      const index =
        Math.floor(
          Math.log(bytes) /
          Math.log(1024)
        );


      return `${(
        bytes /
        Math.pow(1024, index)
      ).toFixed(
        index === 0 ? 0 : 1
      )} ${units[index]}`;

    }, []);


  /* =====================================================
     PROCESSING ANIMATION
  ===================================================== */

  const startProcessingAnimation =
    useCallback(() => {

      stageTimersRef.current.forEach(
        clearTimeout
      );

      stageTimersRef.current = [];

      if (chunkTimerRef.current) {
        clearInterval(chunkTimerRef.current);
        chunkTimerRef.current = null;
      }

      setChunkProgress(0);

      // Keep the first three stages tied to the initial request lifecycle.
      setProcessingStage(
        PROCESSING_STAGES[0].name
      );

      const processingTimer =
        setTimeout(() => {
          setProcessingStage(
            PROCESSING_STAGES[1].name
          );
        }, 900);

      const extractingTimer =
        setTimeout(() => {
          setProcessingStage(
            PROCESSING_STAGES[2].name
          );

          // Fake chunk creation for the UI only.
          // The actual chunking is still performed by the backend.
          let chunk = 1;

          setChunkProgress(chunk);

          chunkTimerRef.current = setInterval(() => {
            chunk += 1;

            // Keep increasing while the request is running.
            // It is only a visual progress indicator.
            setChunkProgress(chunk);
          }, 900);
        }, 1800);

      stageTimersRef.current.push(
        processingTimer,
        extractingTimer
      );

    }, []);


  /* =====================================================
     EXTRACT
  ===================================================== */

  const handleExtract =
    useCallback(async () => {

      if (
        !selectedFile ||
        loading
      ) {

        return;

      }


      setLoading(true);

      setResult(null);

      setError(null);

      setCopied(false);
      setChunkProgress(0);

      if (chunkTimerRef.current) {
        clearInterval(chunkTimerRef.current);
        chunkTimerRef.current = null;
      }

      startProcessingAnimation();


      try {

        const formData =
          new FormData();


        formData.append(
          "file",
          selectedFile
        );


        const response =
          await fetch(
            `${API_URL}/api/v1/documents`,
            {
              method: "POST",
              body: formData,
            }
          );


        let data;


        try {

          data =
            await response.json();

        } catch {

          throw new Error(
            "Server returned an invalid response."
          );

        }


        stageTimersRef.current.forEach(
          clearTimeout
        );


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Failed to process document."
          );

        }


        if (chunkTimerRef.current) {
          clearInterval(chunkTimerRef.current);
          chunkTimerRef.current = null;
        }

        setProcessingStage(
          "Validating"
        );

        await new Promise((resolve) =>
          setTimeout(resolve, reduceMotion ? 100 : 350)
        );

        setChunkProgress(0);

        setProcessingStage(
          "Completed"
        );


        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              reduceMotion
                ? 100
                : 400
            )
        );


        setResult(data);

      } catch (err) {

        stageTimersRef.current.forEach(
          clearTimeout
        );

        if (chunkTimerRef.current) {
          clearInterval(chunkTimerRef.current);
          chunkTimerRef.current = null;
        }

        setChunkProgress(0);

        // User-facing failure message.
        toast.error(
          "Please split the PDF and upload again.",
          {
            position: "top-right",
            autoClose: 5000,
            theme: "colored",
          }
        );

        setError(
          "Please split the PDF and upload again."
        );

      } finally {

        setLoading(false);


        setTimeout(() => {

          setProcessingStage("");

        }, reduceMotion ? 0 : 600);

      }

    }, [
      selectedFile,
      loading,
      startProcessingAnimation,
      reduceMotion,
    ]);


  /* =====================================================
     COPY JSON
  ===================================================== */

  const handleCopyJson =
    useCallback(async () => {

      if (!result) {
        return;
      }


      try {

        await navigator.clipboard.writeText(
          JSON.stringify(
            result,
            null,
            2
          )
        );


        setCopied(true);


        setTimeout(() => {

          setCopied(false);

        }, 1800);

      } catch {

        setError(
          "Unable to copy JSON."
        );

      }

    }, [result]);


  /* =====================================================
     DOWNLOAD JSON
  ===================================================== */

  const handleDownloadJson =
    useCallback(() => {

      if (!result) {
        return;
      }


      const blob =
        new Blob(
          [
            JSON.stringify(
              result,
              null,
              2
            ),
          ],
          {
            type:
              "application/json",
          }
        );


      const url =
        URL.createObjectURL(blob);


      const anchor =
        document.createElement("a");


      anchor.href = url;


      anchor.download =
        `extracted-data-${Date.now()}.json`;


      document.body.appendChild(
        anchor
      );


      anchor.click();


      document.body.removeChild(
        anchor
      );


      URL.revokeObjectURL(url);

    }, [result]);


  /* =====================================================
     DERIVED DATA
  ===================================================== */

  const entities =
    Array.isArray(result?.entities)
      ? result.entities
      : [];


  const entityCount =
    entities.length;


  const currentStageIndex =
    PROCESSING_STAGES.findIndex(
      (stage) =>
        stage.name ===
        processingStage
    );


  const extractionSource =
    result?.extraction?.source ||
    "pdf-text";


  const textLength =
    result?.extraction?.textLength ||
    0;


  const pageCount =
    result?.document?.pageCount ||
    0;


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      <div
        className="
        min-h-screen
        bg-[#f8fafc]
        text-slate-950
      "
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <header
        className="
          border-b
          border-slate-200/80
          bg-white/80
          backdrop-blur-xl
        "
      >

        <div
          className="
            mx-auto
            flex
            max-w-6xl
            items-center
            justify-between
            px-5
            py-5
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-slate-950
                text-white
              "
            >
              <FiFileText size={19} />
            </div>


            <div>

              <h1
                className="
                  text-base
                  font-black
                  tracking-tight
                "
              >
                DocuScan
              </h1>

              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-slate-400
                "
              >
                PDF → OCR → Entities → JSON
              </p>

            </div>

          </div>


          <div
            className="
              hidden
              items-center
              gap-2
              rounded-full
              border
              border-slate-200
              bg-white
              px-3
              py-1.5
              text-[9px]
              font-bold
              text-slate-500
              sm:flex
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-emerald-500
              "
            />

            API Connected

          </div>

        </div>

      </header>


      <main
        className="
          mx-auto
          max-w-6xl
          px-5
          pb-20
          pt-12
        "
      >

        {/* =================================================
            TITLE
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="text-center"
        >

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-blue-100
              bg-blue-50
              px-3
              py-1.5
              text-[9px]
              font-black
              uppercase
              tracking-[0.15em]
              text-blue-600
            "
          >
            <FiZap size={11} />

            Intelligent Document Extraction

          </div>


          <h2
            className="
              mx-auto
              mt-5
              max-w-3xl
              text-4xl
              font-black
              tracking-tight
              text-slate-950
              sm:text-5xl
            "
          >
            Turn any PDF into
            <span className="text-blue-600">
              {" "}structured data.
            </span>
          </h2>


          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-sm
              leading-6
              text-slate-500
            "
          >
            Upload a PDF and the system extracts
            readable text, identifies meaningful
            entities using AI, and returns
            machine-readable JSON.
          </p>

        </motion.div>


        {/* =================================================
            UPLOAD
        ================================================= */}

        {!result && (

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="mx-auto mt-10 max-w-3xl"
          >

            {!selectedFile ? (

              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() =>
                  setDragOver(false)
                }
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className={`
                  cursor-pointer
                  rounded-3xl
                  border-2
                  border-dashed
                  p-12
                  text-center
                  transition-all
                  ${
                    dragOver
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
                  }
                `}
              >

                <div
                  className="
                    mx-auto
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-blue-50
                    text-blue-600
                  "
                >
                  <FiUploadCloud size={28} />
                </div>


                <h3
                  className="
                    mt-5
                    text-xl
                    font-black
                  "
                >
                  Upload your PDF
                </h3>


                <p
                  className="
                    mt-2
                    text-xs
                    text-slate-400
                  "
                >
                  Drag & drop your document here
                  or choose a file
                </p>


                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="
                    mt-6
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-slate-950
                    px-5
                    py-3
                    text-xs
                    font-bold
                    text-white
                    transition
                    hover:bg-blue-600
                  "
                >
                  Choose PDF

                  <FiArrowRight size={14} />

                </button>


                <div
                  className="
                    mt-6
                    flex
                    justify-center
                    gap-3
                    text-[10px]
                    font-medium
                    text-slate-400
                  "
                >
                  <span>PDF only</span>
                  <span>•</span>
                  <span>Maximum 10 MB</span>
                  <span>•</span>
                  <span>No storage required</span>
                </div>


                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleInputChange}
                  className="hidden"
                />

              </div>

            ) : (

              <div
                className="
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                  shadow-[0_20px_60px_rgba(15,23,42,0.06)]
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >

                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-4
                    "
                  >

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        flex-shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-50
                        text-blue-600
                      "
                    >
                      <FiFileText size={23} />
                    </div>


                    <div className="min-w-0">

                      <p
                        className="
                          truncate
                          text-sm
                          font-bold
                        "
                      >
                        {selectedFile.name}
                      </p>


                      <p
                        className="
                          mt-1
                          text-[10px]
                          text-slate-400
                        "
                      >
                        {formatFileSize(
                          selectedFile.size
                        )}
                        {" "}· PDF document
                      </p>

                    </div>

                  </div>


                  <button
                    onClick={removeFile}
                    disabled={loading}
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      text-slate-400
                      hover:bg-red-50
                      hover:text-red-500
                    "
                  >
                    <FiTrash2 size={16} />
                  </button>

                </div>


                {!loading && (

                  <button
                    onClick={handleExtract}
                    className="
                      mt-5
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-slate-950
                      py-3.5
                      text-xs
                      font-bold
                      text-white
                      transition
                      hover:bg-blue-600
                    "
                  >
                    Extract Entities

                    <FiArrowRight size={14} />

                  </button>

                )}


                {loading && (

                  <div
                    className="
                      mt-6
                      rounded-2xl
                      bg-slate-50
                      p-5
                    "
                  >

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-4
                        sm:grid-cols-5
                      "
                    >

                      {PROCESSING_STAGES.map(
                        (stage, index) => {

                          const Icon =
                            stage.icon;

                          const active =
                            index ===
                            currentStageIndex;

                          const complete =
                            index <
                            currentStageIndex;


                          return (
                            <div
                              key={stage.name}
                              className="
                                flex
                                flex-col
                                items-center
                                text-center
                              "
                            >

                              <div
                                className={`
                                  flex
                                  h-10
                                  w-10
                                  items-center
                                  justify-center
                                  rounded-xl
                                  ${
                                    active
                                      ? "bg-blue-50 text-blue-600"
                                      : complete
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-slate-100 text-slate-400"
                                  }
                                `}
                              >

                                {active ? (
                                  <motion.div
                                    animate={{
                                      rotate: 360,
                                    }}
                                    transition={{
                                      duration: 1,
                                      repeat:
                                        Infinity,
                                      ease:
                                        "linear",
                                    }}
                                  >
                                    <Icon size={16} />
                                  </motion.div>
                                ) : complete ? (
                                  <FiCheck size={16} />
                                ) : (
                                  <Icon size={16} />
                                )}

                              </div>


                              <p
                                className={`
                                  mt-2
                                  text-[9px]
                                  font-bold
                                  ${
                                    active
                                      ? "text-blue-600"
                                      : complete
                                      ? "text-emerald-600"
                                      : "text-slate-400"
                                  }
                                `}
                              >
                                {stage.name}
                              </p>

                            </div>
                          );

                        }
                      )}

                    </div>

                    {processingStage === "Extracting" && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="
                          mt-5
                          rounded-xl
                          border
                          border-blue-100
                          bg-white
                          px-4
                          py-3
                        "
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="
                                h-6
                                w-6
                                rounded-lg
                                bg-blue-50
                                text-blue-600
                              "
                            >
                              <FiLayers size={14} className="m-1.5" />
                            </motion.div>

                            <div>
                              <p className="text-[10px] font-black text-slate-700">
                                Creating chunks...
                              </p>
                              <p className="mt-0.5 text-[9px] text-slate-400">
                                Preparing document sections for AI extraction
                              </p>
                            </div>
                          </div>

                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black text-blue-600">
                            Chunk {chunkProgress || 1}
                          </span>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <motion.div
                            className="h-full rounded-full bg-blue-500"
                            animate={{ width: `${Math.min(92, 18 + ((chunkProgress || 1) % 12) * 6)}%` }}
                            transition={{ duration: 0.35 }}
                          />
                        </div>
                      </motion.div>
                    )}

                  </div>

                )}

              </div>

            )}

          </motion.div>

        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              mx-auto
              mt-5
              flex
              max-w-3xl
              items-center
              gap-3
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-4
              text-sm
              text-red-600
            "
          >

            <FiX size={18} />

            <span>
              {error}
            </span>

          </motion.div>

        )}


        {/* =================================================
            RESULT
        ================================================= */}

        {result && (

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-10"
          >

            {/* Success */}

            <div
              className="
                rounded-3xl
                border
                border-emerald-200
                bg-emerald-50/60
                p-6
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >

                <div
                  className="
                    flex
                    h-12
                    w-12
                    flex-shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-emerald-100
                    text-emerald-600
                  "
                >
                  <FiCheckCircle size={26} />
                </div>


                <div className="min-w-0">

                  <p
                    className="
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.16em]
                      text-emerald-600
                    "
                  >
                    Extraction Complete
                  </p>


                  <h3
                    className="
                      mt-1
                      text-xl
                      font-black
                    "
                  >
                    Your data is ready.
                  </h3>


                  <p
                    className="
                      mt-1
                      truncate
                      text-xs
                      text-slate-500
                    "
                  >
                    {result.document?.fileName}
                  </p>

                </div>


                <div className="ml-auto">

                  <span
                    className="
                      hidden
                      rounded-full
                      border
                      border-slate-200
                      bg-white
                      px-3
                      py-1.5
                      text-[9px]
                      font-bold
                      text-slate-500
                      sm:inline-flex
                    "
                  >
                    {extractionSource === "ocr"
                      ? "OCR"
                      : "PDF Text"}
                  </span>

                </div>

              </div>

            </div>


            {/* Stats */}

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="
                mt-4
                grid
                gap-3
                sm:grid-cols-3
              "
            >

              <StatCard
                label="Entities Found"
                value={entityCount}
                icon={FiLayers}
              />


              <StatCard
                label="Text Processed"
                value={textLength.toLocaleString(
                  "en-IN"
                )}
                icon={FiFileText}
              />


              <StatCard
                label="Extraction Method"
                value={
                  extractionSource === "ocr"
                    ? "OCR"
                    : "PDF Text"
                }
                icon={FiDatabase}
              />

            </motion.div>


            {/* Extra document info */}

            <div
              className="
                mt-4
                grid
                gap-3
                sm:grid-cols-2
              "
            >

              <div
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                "
              >

                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-slate-400
                  "
                >
                  Pages
                </p>

                <p
                  className="
                    mt-2
                    text-lg
                    font-black
                  "
                >
                  {pageCount}
                </p>

              </div>


              <div
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                "
              >

                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-slate-400
                  "
                >
                  File Size
                </p>

                <p
                  className="
                    mt-2
                    text-lg
                    font-black
                  "
                >
                  {formatFileSize(
                    result.document?.size || 0
                  )}
                </p>

              </div>

            </div>


            {/* =================================================
                ENTITIES
            ================================================= */}

            <div className="mt-12">

              <div className="mb-5">

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-blue-600
                  "
                >
                  <FiLayers size={12} />

                  Extracted Entities

                </div>


                <h3
                  className="
                    mt-1
                    text-2xl
                    font-black
                    tracking-tight
                  "
                >
                  Document information
                </h3>


                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  Entities dynamically identified
                  from your document using AI.
                </p>

              </div>


              {entities.length > 0 ? (

                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="
                    grid
                    gap-3
                    sm:grid-cols-2
                    lg:grid-cols-3
                  "
                >

                  {entities.map(
                    (entity, index) => (

                      <EntityCard
                        key={`${entity.type}-${entity.value}-${index}`}
                        entity={entity}
                        index={index}
                      />

                    )
                  )}

                </motion.div>

              ) : (

                <div
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-10
                    text-center
                  "
                >

                  <FiSearch
                    className="
                      mx-auto
                      text-slate-300
                    "
                    size={28}
                  />

                  <p
                    className="
                      mt-3
                      text-sm
                      font-bold
                    "
                  >
                    No entities found
                  </p>

                </div>

              )}

            </div>


            {/* =================================================
                JSON
            ================================================= */}

            <div
              className="
                mt-12
                overflow-hidden
                rounded-2xl
                border
                border-slate-800
                bg-[#080d18]
                shadow-[0_25px_70px_rgba(15,23,42,0.18)]
              "
            >

              {/* JSON Header */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  border-b
                  border-slate-800
                  px-5
                  py-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-500/10
                      text-blue-400
                    "
                  >
                    <FiCode size={17} />
                  </div>


                  <div>

                    <p
                      className="
                        text-xs
                        font-bold
                        text-white
                      "
                    >
                      Structured JSON
                    </p>


                    <p
                      className="
                        mt-0.5
                        text-[9px]
                        text-slate-500
                      "
                    >
                      Machine-readable API response
                    </p>

                  </div>

                </div>


                <div
                  className="
                    flex
                    items-center
                    gap-1
                  "
                >

                  <button
                    onClick={handleCopyJson}
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      text-slate-400
                      hover:bg-white/5
                      hover:text-white
                    "
                    title="Copy JSON"
                  >

                    {copied ? (
                      <FiCheck
                        size={16}
                        className="text-emerald-400"
                      />
                    ) : (
                      <FiCopy size={16} />
                    )}

                  </button>


                  <button
                    onClick={handleDownloadJson}
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      text-slate-400
                      hover:bg-white/5
                      hover:text-white
                    "
                    title="Download JSON"
                  >
                    <FiDownload size={16} />
                  </button>

                </div>

              </div>


              {/* JSON Body */}

              <div
                className="
                  max-h-[650px]
                  overflow-auto
                  p-5
                "
              >

                <pre
                  className="
                    whitespace-pre-wrap
                    break-words
                    text-[11px]
                    leading-6
                    text-slate-300
                  "
                  style={{
                    fontFamily:
                      "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",
                  }}
                >
                  {JSON.stringify(
                    result,
                    null,
                    2
                  )}
                </pre>

              </div>

            </div>


            {/* =================================================
                PROCESS ANOTHER
            ================================================= */}

            <div className="mt-8 text-center">

              <button
                onClick={removeFile}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  py-3
                  text-xs
                  font-bold
                  text-slate-600
                  transition
                  hover:border-blue-200
                  hover:text-blue-600
                "
              >

                <FiChevronDown
                  size={14}
                  className="rotate-90"
                />

                Process another document

              </button>

            </div>

          </motion.div>

        )}

      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer
        className="
          border-t
          border-slate-200
          bg-white
        "
      >

        <div
          className="
            mx-auto
            flex
            max-w-6xl
            flex-col
            items-center
            justify-between
            gap-2
            px-5
            py-6
            text-[10px]
            text-slate-400
            sm:flex-row
          "
        >

          <span
            className="
              font-bold
              text-slate-500
            "
          >
            DocuScan
          </span>


          <span>
            PDF parsing · OCR · AI entity extraction · JSON
          </span>

        </div>

      </footer>

      </div>
    </>

  );
}


export default App;