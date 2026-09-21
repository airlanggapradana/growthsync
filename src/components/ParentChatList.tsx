import React from 'react';
import { UserProfile } from '../types';
import KonsultasiNakesView from './KonsultasiNakesView';

export default function ParentChatList({ 
  userProfile, 
  unreadCount, 
  onOpenChat 
}: { 
  userProfile: UserProfile; 
  unreadCount?: number; 
  onOpenChat?: (nakes: UserProfile) => void;
}) {
  return (
    <KonsultasiNakesView 
      currentUser={userProfile}
      unreadCount={unreadCount}
      onBackToDashboard={() => {
        window.history.back();
      }}
    />
  );
}
