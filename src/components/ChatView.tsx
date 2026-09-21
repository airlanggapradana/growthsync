import React from 'react';
import { UserProfile } from '../types';
import KonsultasiNakesView from './KonsultasiNakesView';

export default function ChatView({ 
  currentUser, 
  targetUser, 
  onBack 
}: { 
  currentUser: UserProfile; 
  targetUser: UserProfile | { email: string; uid: string }; 
  onBack: () => void;
}) {
  return (
    <KonsultasiNakesView 
      currentUser={currentUser}
      initialTargetUser={targetUser}
      onBackToDashboard={onBack}
    />
  );
}
