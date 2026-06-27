import axios from "axios";
import fs from "fs";
import path from "path";

const BASE_URL = "https://api.assemblyai.com/v2";

export const transcribeAudio = async (audioUrlOrPath) => {
  try {
    let finalAudioUrl = audioUrlOrPath;

    // Check if it's a local file path or a localhost URL
    if (audioUrlOrPath.includes("localhost") || !audioUrlOrPath.startsWith("http")) {
      console.log("   ..Local file detected, uploading to AssemblyAI...");
      
      // Extract filename from URL if necessary
      let localPath = audioUrlOrPath;
      if (audioUrlOrPath.includes("localhost")) {
        const urlParts = audioUrlOrPath.split("/uploads/");
        localPath = path.join("uploads", urlParts[urlParts.length - 1]);
      }

      if (!fs.existsSync(localPath)) {
        throw new Error(`File not found at path: ${localPath}`);
      }

      const fileData = fs.readFileSync(localPath);
      const uploadRes = await axios.post(`${BASE_URL}/upload`, fileData, {
        headers: {
          authorization: process.env.ASSEMBLY_API_KEY,
          "content-type": "application/octet-stream",
        },
      });
      finalAudioUrl = uploadRes.data.upload_url;
      console.log("   ..Upload successful, starting transcription...");
    }

    const transcriptRes = await axios.post(
      `${BASE_URL}/transcript`,
      {
        audio_url: finalAudioUrl,
        speech_models: ["universal-2"]
      },
      {
        headers: {
          authorization: process.env.ASSEMBLY_API_KEY
        }
      }
    );

    const transcriptId = transcriptRes.data.id;

    while (true) {
      const res = await axios.get(
        `${BASE_URL}/transcript/${transcriptId}`,
        {
          headers: {
            authorization: process.env.ASSEMBLY_API_KEY
          }
        }
      );
      
      process.stdout.write(`   ..AssemblyAI status: ${res.data.status}\r`);

      if (res.data.status === "completed") {
        console.log("\n✅ Transcription finished");
        console.log("Transcript length:", res.data.text.length);
        return res.data.text;
      }

      if (res.data.status === "failed" || res.data.status === "error") {
        console.error("\n❌ AssemblyAI Error:", res.data.error);
        throw new Error(`Transcription failed: ${res.data.error || "Unknown error"}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 4000));
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};