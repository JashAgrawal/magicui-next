"use client"
import { MagicUIProvider } from '@/contexts/MagicUIContext'
import React from 'react'
import { description } from '@/nLib/cons'
import { MagicUIPage } from '@/components/magic-ui'

const page = () => {
  return (
    <MagicUIProvider theme={{}} projectPrd={"Landing page for dune"}>
      <MagicUIPage
        id='landing-pageee'
        moduleName="LandingPage"
        description={description}
        data={{}}
        className='w-full h-screen'
      />
    </MagicUIProvider>
  )
}

export default page