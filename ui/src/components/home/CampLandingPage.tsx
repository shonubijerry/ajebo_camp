'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Box, Container, Grid, Stack } from '@mui/material'
import SlideInDrawer from '@/components/dashboard/SlideInDrawer'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'
import IndividualRegistrationForm from '@/components/registration/IndividualRegistrationForm'
import DonationForm from '@/components/donations/DonationForm'
import { HeroSection } from './campLanding/HeroSection'
import { QuickInfoBar } from './campLanding/QuickInfoBar'
import { AboutSection } from './campLanding/AboutSection'
import { HighlightsSection } from './campLanding/HighlightsSection'
import { VenueSection } from './campLanding/VenueSection'
import { RegistrationCard } from './campLanding/RegistrationCard'
import { KeyDetailsCard } from './campLanding/KeyDetailsCard'
import { ContactCard } from './campLanding/ContactCard'
import { CTASection } from './campLanding/CTASection'
import { FooterSection } from './campLanding/FooterSection'
import { colors, formatMoney } from './campLanding/utils'
import {
  CampLandingPageProps,
  RegistrationType,
  SetRegistrationType,
} from './campLanding/types'

export default function CampLandingPage({ camp }: CampLandingPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campStatus = useMemo(
    () =>
      camp.is_active ? 'Active' : camp.is_coming_soon ? 'Upcoming' : 'Closed',
    [camp.is_active, camp.is_coming_soon],
  )
  const canRegister = camp.is_active
  const [registrationType, setRegistrationType] =
    useState<RegistrationType>('individual')
  const [openDrawer, setOpenDrawer] = useState<
    'login' | 'signup' | 'register' | 'donate' | null
  >(null)

  // Handle URL parameters for opening drawers
  useEffect(() => {
    const action = searchParams.get('action')
    if (
      action === 'login' ||
      action === 'signup' ||
      action === 'register' ||
      action === 'donate'
    ) {
      setOpenDrawer(action)
    }
  }, [searchParams])

  const handleDrawerClose = () => {
    setOpenDrawer(null)
    // Remove the action parameter from URL
    const params = new URLSearchParams(searchParams.toString())
    params.delete('action')
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleOpenDrawer = (
    type: 'login' | 'signup' | 'register' | 'donate',
  ) => {
    setOpenDrawer(type)
    // Add action parameter to URL
    const params = new URLSearchParams(searchParams.toString())
    params.set('action', type)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleRegistrationClick = () => {
    if (registrationType === 'individual') {
      handleOpenDrawer('register')
    } else {
      handleOpenDrawer('login')
    }
  }

  const handleAuthSuccess = () => {
    handleDrawerClose()
    router.push('/portal/dashboard')
  }

  const handleRegistrationSuccess = () => {
    handleDrawerClose()
    // Optionally show a success message or redirect
  }

  const registrationButtonLabel = useMemo(
    () =>
      registrationType === 'group' ? 'Login to Group Portal' : 'Register Now',
    [registrationType],
  )
  const ctaButtonLabel = useMemo(
    () =>
      registrationType === 'group'
        ? 'Login for Group Registration'
        : `Register for ${camp.title}`,
    [registrationType, camp.title],
  )
  const heroPrimaryLabel = useMemo(
    () =>
      canRegister
        ? registrationButtonLabel
        : campStatus === 'Upcoming'
          ? 'Registration Opens Soon'
          : 'Registration Closed',
    [canRegister, registrationButtonLabel, campStatus],
  )

  return (
    <Box sx={{ bgcolor: colors.light }}>
      {/* Hero + Quick Info occupy full viewport height */}
      <Box
        sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <HeroSection
          camp={camp}
          campStatus={campStatus}
          canRegister={canRegister}
          registrationType={registrationType}
          setRegistrationType={setRegistrationType as SetRegistrationType}
          registrationButtonLabel={registrationButtonLabel}
          heroPrimaryLabel={heroPrimaryLabel}
          onRegister={handleRegistrationClick}
          onDonate={() => handleOpenDrawer('donate')}
        />

        <QuickInfoBar camp={camp} formatMoney={formatMoney} />
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 8 }} id="details">
        <Grid container spacing={4}>
          {/* Left Column - Main Info */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={4}>
              <AboutSection description={camp.description} />
              <HighlightsSection highlights={camp.highlights} />
              <VenueSection venue={camp.venue} location={camp.location} />
            </Stack>
          </Grid>

          {/* Right Column - Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              <RegistrationCard
                camp={camp}
                canRegister={canRegister}
                registrationType={registrationType}
                setRegistrationType={setRegistrationType as SetRegistrationType}
                registrationButtonLabel={registrationButtonLabel}
                onRegister={handleRegistrationClick}
              />
              <KeyDetailsCard camp={camp} />
              <ContactCard
                contactEmail={camp.contact_email}
                contactPhone={camp.contact_phone}
                isActive={camp.is_active}
              />
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <CTASection
        canRegister={canRegister}
        registrationType={registrationType}
        setRegistrationType={setRegistrationType as SetRegistrationType}
        onRegister={handleRegistrationClick}
        ctaButtonLabel={ctaButtonLabel}
      />

      <FooterSection />

      {/* Slide-in Drawers */}
      <SlideInDrawer
        open={openDrawer === 'register'}
        onClose={handleDrawerClose}
        title="Individual Registration"
        width={700}
      >
        <IndividualRegistrationForm
          campId={camp.id}
          onSuccess={handleRegistrationSuccess}
        />
      </SlideInDrawer>

      <SlideInDrawer
        open={openDrawer === 'login'}
        onClose={handleDrawerClose}
        title="Group Portal Login"
        width={500}
      >
        <LoginForm
          onSuccess={handleAuthSuccess}
          onSignupClick={() => handleOpenDrawer('signup')}
        />
      </SlideInDrawer>

      <SlideInDrawer
        open={openDrawer === 'signup'}
        onClose={handleDrawerClose}
        title="Create Group Account"
        width={500}
      >
        <SignupForm
          onSuccess={handleAuthSuccess}
          onLoginClick={() => handleOpenDrawer('login')}
        />
      </SlideInDrawer>

      <SlideInDrawer
        open={openDrawer === 'donate'}
        onClose={handleDrawerClose}
        title="Make a Donation"
        width={500}
      >
        <DonationForm
          campTitle={camp.title}
          onSuccess={handleDrawerClose}
          onClose={handleDrawerClose}
        />
      </SlideInDrawer>
    </Box>
  )
}
