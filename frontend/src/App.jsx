import { useState } from "react"
import axios from "axios"

export default function App() {
  const [inputType, setInputType] = useState("url")
  const [url, setUrl] = useState("")
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      if (inputType === "url") {
        const res = await axios.post("https://fakenews-detector-h4lw.onrender.com/analyze/text", { url })
        setResult(res.data)
      } else {
        const formData = new FormData()
        formData.append("file", image)
        const res = await axios.post("https://fakenews-detector-h4lw.onrender.com/analyze/image", formData)
        setResult(res.data)
      }
    } catch (err) {
      setError("Something went wrong. Make sure the backend is running.")
    }

    setLoading(false)
  }

  const getScoreColor = (score) => {
    if (score >= 70) return "text-green-500"
    if (score >= 40) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreLabel = (score) => {
    if (score >= 70) return "Likely Credible"
    if (score >= 40) return "Suspicious"
    return "Likely Fake"
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-12">
      <h1 className="text-4xl font-bold mb-2 text-center">Fake News & Deepfake Detector</h1>
      <p className="text-gray-400 mb-10 text-center">Paste a news URL or upload an image to check its credibility</p>

      <div className="w-full max-w-2xl bg-gray-900 rounded-2xl p-8 shadow-xl">

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setInputType("url")}
            className={`flex-1 py-2 rounded-lg font-medium transition ${inputType === "url" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}
          >
            News URL
          </button>
          <button
            onClick={() => setInputType("image")}
            className={`flex-1 py-2 rounded-lg font-medium transition ${inputType === "image" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}
          >
            Image Upload
          </button>
        </div>

        {inputType === "url" ? (
          <input
            type="text"
            placeholder="https://example.com/news-article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 mb-4 outline-none"
          />
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {error && <p className="mt-4 text-red-400 text-center">{error}</p>}

        {result && (
          <div className="mt-8 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Result</h2>
              <span className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}/100
              </span>
            </div>
            <p className={`text-lg font-medium mb-4 ${getScoreColor(result.score)}`}>
              {getScoreLabel(result.score)}
            </p>
            <h3 className="text-gray-400 text-sm font-semibold uppercase mb-2">Analysis</h3>
            <p className="text-gray-200 text-sm leading-relaxed mb-4">{result.analysis}</p>
            {result.red_flags && result.red_flags.length > 0 && (
              <>
                <h3 className="text-gray-400 text-sm font-semibold uppercase mb-2">Red Flags</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.red_flags.map((flag, i) => (
                    <li key={i} className="text-red-400 text-sm">{flag}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}