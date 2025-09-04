import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

export interface UserRole {
  role: 'superadmin' | 'organizer' | 'guest';
  eventId?: string; // For organizers managing specific events
}

export interface UserProfile extends UserRole {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
  last_login: string;
}

// Authentication functions
export const signInUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Update last login
    if (data.user) {
      await updateUserLastLogin(data.user.id)
    }

    return data.user
  } catch (error) {
    throw error
  }
}

export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    throw error
  }
}

export const createUser = async (email: string, password: string, role: UserRole['role'], displayName?: string) => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        }
      }
    })

    if (authError) throw authError

    if (authData.user) {
      // Create user profile directly
      const userProfile = {
        id: authData.user.id,
        email: authData.user.email!,
        display_name: displayName || authData.user.user_metadata?.display_name || '',
        role,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        ...(role === 'organizer' && { event_id: '' })
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([userProfile])

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        // Don't throw here, as the user was created successfully in auth
      }
    }

    return authData.user
  } catch (error) {
    throw error
  }
}

// Get user profile from database
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - user profile doesn't exist
        console.log('User profile not found, creating one...')
        
        // Get user info from auth
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          console.error('Error getting user:', userError)
          return null
        }

        // Create user profile
        const userProfile = {
          id: user.id,
          email: user.email!,
          display_name: user.user_metadata?.display_name || 'User',
          role: 'guest' as const,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        }

        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([userProfile])

        if (insertError) {
          console.error('Error creating user profile:', insertError)
          return null
        }

        return userProfile as UserProfile
      }
      throw error
    }

    return data as UserProfile
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Update user last login
export const updateUserLastLogin = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating last login:', error)
  }
}

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null)
  })
}

// Check if user has specific role
export const hasRole = (userProfile: UserProfile | null, requiredRole: UserRole['role']): boolean => {
  if (!userProfile) return false
  
  const roleHierarchy = {
    superadmin: 3,
    organizer: 2,
    guest: 1
  }
  
  return roleHierarchy[userProfile.role] >= roleHierarchy[requiredRole]
}

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}
