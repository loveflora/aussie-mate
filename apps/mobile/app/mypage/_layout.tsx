import { Stack } from 'expo-router';
import React from 'react';

export default function MyPageLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="edit"
        options={{
          headerShown: false, // 헤더는 컴포넌트 내부에서 직접 관리
        }}
      />
    </Stack>
  );
}
