import { selectCurrentUser, selectPartner, useAppStore } from '../features/useAppStore'

export const useSession = () => {
  const currentUser = useAppStore(selectCurrentUser)
  const partner = useAppStore(selectPartner)
  return { currentUser, partner }
}
