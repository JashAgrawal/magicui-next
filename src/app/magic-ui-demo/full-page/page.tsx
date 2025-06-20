"use client"
import { MagicUIPage, MagicUIProvider } from '@/components/magic-ui'
import { description } from '@/nLib/cons'
import { features } from 'process'
import React from 'react'

const page = () => {
  return (
    <MagicUIProvider theme={{}} projectPrd={"ecommerce application"} apiKey={"AIzaSyAy0vF50gs4wCkByXb148TEGhWsCVvHo_8"}>
      <MagicUIPage
      id='landingPage'
      moduleName="LandingPage"
      description={description}
      data={{features:[
        "No-Code App Builder",
        "One Unified Buyer App",
        "QR & Link-Based Store Discovery",
        "Auto-Adapts to Store Type",
        "Distraction-Free Shopping",
        "No Repeated Address Entry"
      ],
      
      }}
      className='w-full h-screen'
    />
    </MagicUIProvider>
  )
}

export default page