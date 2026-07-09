"""Offline voice STT/TTS helpers for voice help desk mode."""

from __future__ import annotations

import io
import subprocess
import tempfile
from pathlib import Path


async def transcribe_audio_file(raw_audio: bytes, suffix: str = ".wav") -> str:
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as handle:
        handle.write(raw_audio)
        temp_path = Path(handle.name)

    try:
        from faster_whisper import WhisperModel

        model = WhisperModel("base", device="cpu", compute_type="int8")
        segments, _ = model.transcribe(str(temp_path), beam_size=1)
        text = " ".join(segment.text.strip() for segment in segments if segment.text.strip())
        return text.strip() or ""
    except Exception:
        return ""
    finally:
        try:
            temp_path.unlink(missing_ok=True)
        except Exception:
            pass


async def synthesize_speech(text: str) -> bytes:
    # Prefer local piper CLI when present. Fall back to plain text bytes for demo continuity.
    piper = "piper"
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as out_file:
        output_path = Path(out_file.name)

    try:
        completed = subprocess.run(
            [piper, "--output_file", str(output_path)],
            input=text.encode("utf-8"),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        if completed.returncode == 0 and output_path.exists():
            return output_path.read_bytes()
    except Exception:
        pass
    finally:
        try:
            output_path.unlink(missing_ok=True)
        except Exception:
            pass

    return io.BytesIO(text.encode("utf-8")).getvalue()
