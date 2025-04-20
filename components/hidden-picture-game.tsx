"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { gameData } from "@/utils/question"
import { useViewportSize } from "@/hooks/use-viewport-size"
import Confetti from "react-confetti"

export default function HiddenPictureGame() {
	const [revealedPieces, setRevealedPieces] = useState<number[]>([])
	const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
	const [currentQuestion, setCurrentQuestion] = useState<number | null>(null)
	const [isShaking, setIsShaking] = useState(false)
	const [guessDialogOpen, setGuessDialogOpen] = useState(false)
	const [topicGuess, setTopicGuess] = useState("")
	const [guessResult, setGuessResult] = useState<
		"correct" | "incorrect" | null
	>(null)
	const [gameComplete, setGameComplete] = useState(false)
	const [incorrectAnswer, setIncorrectAnswer] = useState(false)
	const { width, height } = useViewportSize()

	const handleQuestionSelect = (questionId: number) => {
		if (!revealedPieces.includes(questionId)) {
			setCurrentQuestion(questionId)
			setQuestionDialogOpen(true)
			setIncorrectAnswer(false)
		}
	}

	const handleAnswerSelect = (answer: string) => {
		const question = gameData.questions.find(
			(q) => q.id === currentQuestion
		)

		if (question && answer === question.correctAnswer) {
			// Correct answer
			setRevealedPieces((prev) => [...prev, currentQuestion!])
			setQuestionDialogOpen(false)
			setCurrentQuestion(null)

			// Check if all pieces are revealed
			if (revealedPieces.length + 1 === gameData.questions.length) {
				setGameComplete(true)
			}
		} else {
			// Incorrect answer - shake effect
			setIsShaking(true)
			setIncorrectAnswer(true)
			setTimeout(() => setIsShaking(false), 500)
		}
	}

	const handleTopicGuess = () => {
		// Normalize the user input
		const normalizeString = (str: string) => {
			// Convert to lowercase and trim
			const normalized = str.toLowerCase().trim()
			// Remove diacritics (accents)
			return normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
		}

		const normalizedGuess = normalizeString(topicGuess)

		// Handle topic as an array
		const topics = Array.isArray(gameData.topic)
			? gameData.topic
			: [gameData.topic]

		// Check if the guess matches any of the acceptable answers
		const isCorrect = topics.some(
			(topic) => normalizeString(topic) === normalizedGuess
		)

		if (isCorrect) {
			setGuessResult("correct")
			setGameComplete(true)
		} else {
			setGuessResult("incorrect")
		}
	}

	const resetGame = () => {
		setRevealedPieces([])
		setCurrentQuestion(null)
		setQuestionDialogOpen(false)
		setGuessDialogOpen(false)
		setTopicGuess("")
		setGuessResult(null)
		setGameComplete(false)
		setIncorrectAnswer(false)
	}

	const handleCloseQuestionDialog = () => {
		setQuestionDialogOpen(false)
		setCurrentQuestion(null)
		setIncorrectAnswer(false)
	}

	// Calculate position for a piece in a 4x3 grid
	const getPiecePosition = (index: number) => {
		const col = index % 4
		const row = Math.floor(index / 4)
		return {
			backgroundPosition: `${col * 33.33}% ${row * 50}%`,
		}
	}

	return (
		<>
			{gameComplete && <Confetti width={width} height={height} />}
			<div className="flex flex-col lg:flex-row gap-8">
				{/* Left side - Hidden Picture Grid */}
				<div className="flex-1">
					<div
						className="relative border border-gray-300 rounded-lg overflow-hidden"
						style={{ aspectRatio: "16/9" }}
					>
						{/* Full image (revealed at the end) */}
						{gameComplete && guessResult === "correct" && (
							<div className="absolute inset-0 z-20 flex items-center justify-center bg-white">
								<img
									src={gameData.image || "/placeholder.svg"}
									alt="Hình ảnh hoàn chỉnh"
									className="w-full h-full"
								/>
							</div>
						)}

						{/* Grid of image pieces - 4x3 layout */}
						<div className="grid grid-cols-4 grid-rows-3 h-full w-full">
							{Array.from({ length: 12 }).map((_, index) => {
								const pieceId = index + 1
								const isRevealed =
									revealedPieces.includes(pieceId)

								return (
									<div
										key={pieceId}
										className={`border border-gray-200 relative cursor-pointer ${
											!isRevealed && !gameComplete
												? "bg-gray-100 hover:bg-gray-200"
												: ""
										}`}
										onClick={() =>
											!isRevealed &&
											handleQuestionSelect(pieceId)
										}
									>
										{isRevealed && (
											<div
												className="absolute inset-0 bg-cover bg-center"
												style={{
													backgroundImage: `url(${gameData.image})`,
													...getPiecePosition(index),
													backgroundSize: "400% 300%", // 4 columns, 3 rows
												}}
											/>
										)}

										{!isRevealed && !gameComplete && (
											<div className="absolute inset-0 flex items-center justify-center">
												<span className="text-2xl font-bold text-gray-500">
													{pieceId}
												</span>
											</div>
										)}
									</div>
								)
							})}
						</div>
					</div>

					<div className="mt-4 flex justify-between">
						<Button
							onClick={() => setGuessDialogOpen(true)}
							variant="outline"
						>
							Đoán Chủ Đề
						</Button>

						<div className="text-sm">
							Đã mở:{" "}
							{gameComplete
								? gameData.questions.length
								: revealedPieces.length}{" "}
							/ {gameData.questions.length}
						</div>
					</div>
				</div>

				{/* Right side - Game Instructions */}
				<div className="flex-1">
					<div className="p-6 border rounded-lg">
						<h2 className="text-xl font-bold mb-4">Cách Chơi</h2>
						<ul className="space-y-2 list-disc pl-5">
							<li>Nhấp vào ô số bất kỳ để hiển thị câu hỏi</li>
							<li>Trả lời đúng để mở phần của hình ảnh ẩn</li>
							<li>Có thể đoán chủ đề bất cứ lúc nào</li>
							<li>
								Mở tất cả các mảnh hoặc đoán đúng chủ đề để
								thắng
							</li>
						</ul>

						<div className="mt-6">
							<h3 className="font-semibold mb-2">Tiến Trình</h3>
							<div className="grid grid-cols-4 gap-2">
								{Array.from({ length: 12 }).map((_, index) => {
									const pieceId = index + 1
									const isRevealed =
										revealedPieces.includes(pieceId)

									return (
										<div
											key={pieceId}
											className={`h-8 flex items-center justify-center rounded border ${
												isRevealed
													? "bg-green-100 border-green-300"
													: "bg-gray-100 border-gray-300"
											}`}
										>
											{pieceId}
											{isRevealed && (
												<CheckCircle2 className="ml-1 h-3 w-3 text-green-600" />
											)}
										</div>
									)
								})}
							</div>
						</div>

						{gameComplete && (
							<div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
								<h3 className="font-semibold">
									Đã mở tất cả các mảnh!
								</h3>
								<p>Bạn có thể đoán chủ đề bây giờ?</p>
								<Button
									onClick={() => setGuessDialogOpen(true)}
									className="mt-2"
									variant="outline"
									size="sm"
								>
									Đoán Ngay
								</Button>
							</div>
						)}
					</div>
				</div>

				{/* Question Dialog */}
				<Dialog
					open={questionDialogOpen}
					onOpenChange={setQuestionDialogOpen}
				>
					<DialogContent
						className={`sm:max-w-md ${
							isShaking ? "animate-shake" : ""
						}`}
					>
						<DialogHeader>
							<DialogTitle>Câu Hỏi {currentQuestion}</DialogTitle>
						</DialogHeader>

						{currentQuestion && (
							<div className="py-4">
								<p className="mb-6">
									{
										gameData.questions.find(
											(q) => q.id === currentQuestion
										)?.question
									}
								</p>

								<div className="space-y-3">
									{gameData.questions
										.find((q) => q.id === currentQuestion)
										?.options.map((option, index) => (
											<button
												key={index}
												className="w-full text-left p-3 border rounded-md hover:bg-gray-100 transition-colors"
												onClick={() =>
													handleAnswerSelect(option)
												}
											>
												{option}
											</button>
										))}
								</div>

								{incorrectAnswer && (
									<div className="mt-4 p-3 bg-red-100 rounded-md flex items-center">
										<AlertCircle className="h-5 w-5 text-red-600 mr-2" />
										<span>
											Câu trả lời không đúng. Hãy thử lại!
										</span>
									</div>
								)}
							</div>
						)}

						<DialogFooter>
							<Button
								variant="outline"
								onClick={handleCloseQuestionDialog}
							>
								Đóng
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Guess Dialog */}
				<Dialog
					open={guessDialogOpen}
					onOpenChange={setGuessDialogOpen}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Đoán Chủ Đề Hình Ảnh Ẩn</DialogTitle>
						</DialogHeader>

						<div className="py-4">
							<Input
								placeholder="Nhập đoán của bạn..."
								value={topicGuess}
								onChange={(e) => setTopicGuess(e.target.value)}
							/>

							{guessResult && (
								<div
									className={`mt-4 p-3 rounded-md flex items-center ${
										guessResult === "correct"
											? "bg-green-100"
											: "bg-red-100"
									}`}
								>
									{guessResult === "correct" ? (
										<>
											<CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
											<span>Chính xác!</span>
										</>
									) : (
										<>
											<AlertCircle className="h-5 w-5 text-red-600 mr-2" />
											<span>
												Không đúng. Hãy thử lại hoặc
												tiếp tục mở các mảnh.
											</span>
										</>
									)}
								</div>
							)}
						</div>

						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setGuessDialogOpen(false)}
							>
								Hủy
							</Button>
							<Button onClick={handleTopicGuess}>Gửi Đoán</Button>
							{guessResult === "correct" && (
								<Button onClick={resetGame} variant="outline">
									Chơi Lại
								</Button>
							)}
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</>
	)
}
