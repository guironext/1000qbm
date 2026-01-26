'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { handleCommencerClick } from '@/lib/actions/handleCommencer'

interface Stage {
  id: string
  title: string
  image: string
  niveau: string
  descriptions: { id: string; texte: string }[]
}

interface BoardPageProps {
  stage: Stage
}

const BoardPageClient = ({ stage }: BoardPageProps) => {
  const handleClick = async () => {
    try {
      await handleCommencerClick()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="min-h-screen  p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            Bienvenue au {stage.niveau}
          </h1>
        </div>

        {/* Mobile Layout */}
        <div className="block lg:hidden space-y-6">
          {/* Image */}
          <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={stage.image}
              alt={stage.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Content */}
          <div className=" rounded-lg shadow-lg p-6 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
              {stage.title}
            </h2>
            
            <div className="space-y-4">
              {stage.descriptions.map((d, index) => (
                <p key={index} className="text-base sm:text-lg text-gray-700 leading-relaxed text-justify">
                  {d.texte}
                </p>
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <Button 
                
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg sm:text-xl transition-colors"
              >
                Commençons
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-8 xl:gap-12">
          {/* Left - Image */}
          <div className="relative w-full h-[400px] xl:h-[500px] rounded-lg overflow-hidden shadow-lg">
            <Image
              src={stage.image}
              alt={stage.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Right - Content */}
          <div className="flex flex-col justify-center space-y-6 xl:space-y-8">
            <h2 className="text-3xl xl:text-4xl font-bold text-gray-800">
              {stage.title}
            </h2>
            
            <div className="space-y-4 xl:space-y-6">
              {stage.descriptions.map((d, index) => (
                <p key={index} className="text-lg xl:text-xl text-gray-700 leading-relaxed text-justify">
                  {d.texte}
                </p>
              ))}
            </div>

            <div className="flex justify-start pt-4">
              <Button 
                onClick={handleClick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-lg text-xl xl:text-2xl transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Commençons
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BoardPageClient