"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useViewportSize } from "@/hooks/use-viewport-size";
import Confetti from "react-confetti";
import { gameData } from "@/utils/question";

export default function HiddenPictureGame() {
  const [revealedPieces, setRevealedPieces] = useState<number[]>([]);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<number | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [guessDialogOpen, setGuessDialogOpen] = useState(false);
  const [topicGuess, setTopicGuess] = useState("");
  const [guessResult, setGuessResult] = useState<"correct" | "incorrect" | null>(
    null
  );
  const [gameComplete, setGameComplete] = useState(false);
  const [incorrectAnswer, setIncorrectAnswer] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useViewportSize();

  const handleQuestionSelect = (questionId: number) => {
    if (!revealedPieces.includes(questionId)) {
      setCurrentQuestion(questionId);
      setQuestionDialogOpen(true);
      setIncorrectAnswer(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const question = gameData.questions.find((q) => q.id === currentQuestion);

    if (question && answer === question.correctAnswer) {
      setRevealedPieces((prev) => [...prev, currentQuestion!]);
      setQuestionDialogOpen(false);
      setCurrentQuestion(null);

      if (revealedPieces.length + 1 === gameData.questions.length) {
        setGameComplete(true);
      }
    } else {
      setIsShaking(true);
      setIncorrectAnswer(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleTopicGuess = () => {
    const normalizedGuess = topicGuess.toLowerCase().trim();
    const normalizedTopic = gameData.topic.join(" ").toLowerCase().trim();

    if (normalizedGuess === normalizedTopic) {
      setGuessResult("correct");
      setGameComplete(true);
      setShowConfetti(true);
    } else {
      setGuessResult("incorrect");
    }
  };

  const resetGame = () => {
    setRevealedPieces([]);
    setCurrentQuestion(null);
    setQuestionDialogOpen(false);
    setGuessDialogOpen(false);
    setTopicGuess("");
    setGuessResult(null);
    setGameComplete(false);
    setIncorrectAnswer(false);
    setShowConfetti(false);
  };

  const handleCloseQuestionDialog = () => {
    setQuestionDialogOpen(false);
    setCurrentQuestion(null);
    setIncorrectAnswer(false);
  };

  return (
    <>
      {showConfetti && (
        <Confetti width={width} height={height} className="z-[1000]" />
      )}
      <div className="flex flex-col px-4 sm:px-8 md:px-16 justify-center">
        {/* Hidden Picture Grid */}
        <div className="w-full max-w-[75vw] mx-auto ">
          <div
            className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://media.istockphoto.com/id/495632233/vi/anh/c%E1%BA%ADn-c%E1%BA%A3nh-c%E1%BB%9D-vi%E1%BB%87t-nam.jpg?s=612x612&w=0&k=20&c=Qy0y0kxJh_Pic5Xlk8zcL-6b_Sf8zchJ8OCCnij1PsQ=')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "scroll",
              filter: "brightness(1.2) contrast(1.1)", 
            }}
          >
            {gameComplete && guessResult === "correct" && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white">
                <div className="text-center">
                  <img
                    src={gameData.image || "/placeholder.svg"}
                    alt="Complete hidden picture"
                    className="w-full h-auto"
                  />
                  <h2 className="text-2xl font-bold mt-4 capitalize">
                    Topic: {gameData.topic}
                  </h2>
                  <Button onClick={resetGame} className="my-4">
                    Play Again
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 grid-rows-3 border-2 border-yellow-200 rounded-lg overflow-hidden">	
              {Array.from({ length: 12 }).map((_, index) => {
                const pieceId = index + 1;
                const isRevealed = revealedPieces.includes(pieceId);

                return (
                  <div
                    key={pieceId}
                    className={`border border-red-300 relative cursor-pointer h-44 w-full ${
                      !isRevealed && !gameComplete
                        ? "bg-white/30 hover:bg-white/40" 
                        : ""
                    }`}
                    onClick={() =>
                      !isRevealed && handleQuestionSelect(pieceId)
                    }
                  >
                    {isRevealed && (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${gameData.image})`,
                          backgroundPosition: `${(index % 4) * 33.33}% ${
                            Math.floor(index / 4) * 50
                          }%`,
                          backgroundSize: "400% 300%",
                        }}
                      />
                    )}

                    {!isRevealed && !gameComplete && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-800 px-4 py-2  ">
                          {pieceId}
                        </span>
                      </div>
                    )}
                  </div>
                );
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
              Revealed: {revealedPieces.length} / {gameData.questions.length}
            </div>
          </div>
        </div>

        {/* Question Dialog */}
        <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
          <DialogContent
            className={`sm:max-w-md ${isShaking ? "animate-shake" : ""}`}
          >
            <DialogHeader>
              <DialogTitle>Question {currentQuestion}</DialogTitle>
            </DialogHeader>

            {currentQuestion && (
              <div className="py-4">
                <p className="mb-6">
                  {
                    gameData.questions.find((q) => q.id === currentQuestion)
                      ?.question
                  }
                </p>

                <div className="space-y-3">
                  {gameData.questions
                    .find((q) => q.id === currentQuestion)
                    ?.options.map((option, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-3 border rounded-md hover:bg-gray-100 transition-colors"
                        onClick={() => handleAnswerSelect(option)}
                      >
                        {option}
                      </button>
                    ))}
                </div>

                {incorrectAnswer && (
                  <div className="mt-4 p-3 bg-red-100 rounded-md flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span>Incorrect answer. Try again!</span>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseQuestionDialog}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Guess Dialog */}
        <Dialog open={guessDialogOpen} onOpenChange={setGuessDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Guess the Hidden Picture Topic</DialogTitle>
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
                    guessResult === "correct" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {guessResult === "correct" ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                      <span>Correct! The topic is "{gameData.topic}".</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      <span>
                        Incorrect. Try again or continue revealing pieces.
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
              <Button onClick={handleTopicGuess}>Submit Guess</Button>
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
  );
}