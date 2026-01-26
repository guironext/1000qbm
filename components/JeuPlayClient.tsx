'use client'

import React, { useState } from 'react'

interface Reponse {
  id: string
  intitule: string
  isCorrect: boolean
}

interface Question {
  id: string
  intitule: string
  reponses: Reponse[]
}

interface Stage {
  id: string
  title: string
}

interface Section {
  id: string
  title: string
}

interface JeuPlayProps {
  questions: Question[]
   
  stage: Stage | null
  section: Section | null
}

const JeuPlayClient = ({ questions, stage, section }: JeuPlayProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentQuestion = questions[currentIndex]

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  return (
    <div className="min-h-screen  dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Jeu</h1>
        <h1>
        {stage?.title} - {section?.title}
        </h1>
        {currentQuestion ? (
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{currentQuestion.intitule}</h2>
            <div className="space-y-2">
              {currentQuestion.reponses.map((reponse) => (
                <div key={reponse.id} className="p-2 border rounded">
                  {reponse.intitule}
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              {currentIndex < questions.length - 1 ? (
                <button onClick={handleNext} className="bg-blue-600 text-white px-4 py-2 rounded">
                  Next
                </button>
              ) : (
                <p className="text-green-600 font-semibold">Finished!</p>
              )}
            </div>
          </div>
        ) : (
          <p>No questions</p>
        )}
      </div>
    </div>
  )
}

export default JeuPlayClient