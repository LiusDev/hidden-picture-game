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
import { useViewportSize } from "@/hooks/use-viewport-size"
import Confetti from "react-confetti"
import { gameData } from "@/utils/question"

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
	const [showConfetti, setShowConfetti] = useState(false)
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
		const normalizedGuess = topicGuess.toLowerCase().trim()
		const normalizedTopic = gameData.topic.toLowerCase().trim()

		if (normalizedGuess === normalizedTopic) {
			setGuessResult("correct")
			setGameComplete(true)
			setShowConfetti(true)
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
		setShowConfetti(false)
	}

	const handleCloseQuestionDialog = () => {
		setQuestionDialogOpen(false)
		setCurrentQuestion(null)
		setIncorrectAnswer(false)
	}

	return (
		<>
			{showConfetti && (
				<Confetti width={width} height={height} className="z-[1000]" />
			)}
			<div className="flex flex-col lg:flex-row gap-8">
				{/* Left side - Hidden Picture Grid */}
				<div className="flex-1">
					<div className="relative aspect-square border border-gray-300 rounded-lg overflow-hidden">
						{/* Full image (revealed at the end) */}
						{gameComplete && guessResult === "correct" && (
							<div className="absolute inset-0 z-20 flex items-center justify-center bg-white">
								<div className="text-center">
									<img
										src={
											gameData.image || "/placeholder.svg"
										}
										alt="Complete hidden picture"
										className="w-full h-auto"
									/>
									<h2 className="text-2xl font-bold mt-4 capitalize">
										Topic: {gameData.topic}
									</h2>
									<Button
										onClick={resetGame}
										className="my-4"
									>
										Play Again
									</Button>
								</div>
							</div>
						)}

						{/* Grid of image pieces */}
						<div className="grid grid-cols-3 grid-rows-4 h-full w-full">
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
													backgroundPosition: `${
														(index % 3) * 50
													}% ${
														Math.floor(index / 3) *
														33.33
													}%`,
													backgroundSize: "300% 400%",
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
							Guess the Topic
						</Button>

						<div className="text-sm">
							Revealed: {revealedPieces.length} /{" "}
							{gameData.questions.length}
						</div>
					</div>
				</div>

				{/* Right side - Game Instructions */}
				<div className="flex-1">
					<div className="p-6 border rounded-lg">
						<h2 className="text-xl font-bold mb-4">How to Play</h2>
						<ul className="space-y-2 list-disc pl-5">
							<li>
								Click on any numbered square to reveal a
								question
							</li>
							<li>
								Answer correctly to reveal that piece of the
								hidden image
							</li>
							<li>Try to guess the overall topic at any time</li>
							<li>
								Reveal all pieces or correctly guess the topic
								to win
							</li>
						</ul>

						<div className="mt-6">
							<h3 className="font-semibold mb-2">
								Game Progress
							</h3>
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
									All pieces revealed!
								</h3>
								<p>Can you guess the topic now?</p>
								<Button
									onClick={() => setGuessDialogOpen(true)}
									className="mt-2"
									variant="outline"
									size="sm"
								>
									Make Your Guess
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
							<DialogTitle>
								Question {currentQuestion}
							</DialogTitle>
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
											Incorrect answer. Try again!
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
								Close
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
							<DialogTitle>
								Guess the Hidden Picture Topic
							</DialogTitle>
						</DialogHeader>

						<div className="py-4">
							<Input
								placeholder="Enter your guess..."
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
											<span>
												Correct! The topic is "
												{gameData.topic}".
											</span>
										</>
									) : (
										<>
											<AlertCircle className="h-5 w-5 text-red-600 mr-2" />
											<span>
												Incorrect. Try again or continue
												revealing pieces.
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
								Cancel
							</Button>
							<Button onClick={handleTopicGuess}>
								Submit Guess
							</Button>
							{guessResult === "correct" && (
								<Button onClick={resetGame} variant="outline">
									Play Again
								</Button>
							)}
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</>
	)
}
