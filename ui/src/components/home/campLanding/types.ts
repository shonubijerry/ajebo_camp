import { Dispatch, SetStateAction } from 'react'
import { Camp } from '@/interfaces'

export type RegistrationType = 'individual' | 'group'

export interface CampLandingPageProps {
  camp: Camp
}

export type SetRegistrationType = Dispatch<SetStateAction<RegistrationType>>
