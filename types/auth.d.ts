declare module '#auth-utils' {
  interface User {
    id: number
    username: string
    email: string
    name: string
    avatar?: string
    role: 'Administrator' | 'RegistryOfficer' | 'SurveyTeam' | 'Management'
  }

  interface UserSession {
    // Add custom session data here if needed
  }
}

export {}
