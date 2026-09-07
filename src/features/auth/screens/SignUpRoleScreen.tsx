import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, UserRole } from '@/navigation/types';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { Button } from '@/shared/components/Button';
import { palette, radius, spacing } from '@/shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpRole'>;

const ROLES: Array<{
  value: UserRole;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    value: 'buyer',
    title: 'Buyer',
    description: 'Browse and order equipment, services, products and gold.',
    icon: 'cart-outline',
  },
  {
    value: 'supplier',
    title: 'Supplier',
    description: 'List and sell your equipment, services, products and gold.',
    icon: 'storefront-outline',
  },
];

export function SignUpRoleScreen({ navigation }: Props): React.ReactElement {
  const [role, setRole] = React.useState<UserRole | null>(null);

  return (
    <View style={styles.root}>
      <AppTopBar left="back" title="Account type" onBackPress={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>How will you use MineMarket?</Text>
          <Text style={styles.subtitle}>You can change this later in settings.</Text>
        </View>

        <View style={styles.options}>
          {ROLES.map((option) => {
            const selected = role === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.85}
                style={[styles.card, selected && styles.cardSelected]}
                onPress={() => setRole(option.value)}
              >
                <View style={[styles.iconTile, selected && styles.iconTileSelected]}>
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={selected ? palette.charcoal : palette.gold}
                  />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{option.title}</Text>
                  <Text style={styles.cardDescription}>{option.description}</Text>
                </View>
                <Ionicons
                  name={selected ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={selected ? palette.gold : palette.muted}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Button
            label="Continue"
            disabled={!role}
            onPress={() => role && navigation.navigate('SignUpPhone', { role })}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.pureWhite,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.charcoal,
  },
  subtitle: {
    fontSize: 14,
    color: palette.muted,
  },
  options: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  cardSelected: {
    borderColor: palette.gold,
    backgroundColor: palette.softGold,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTileSelected: {
    backgroundColor: palette.gold,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.charcoal,
  },
  cardDescription: {
    fontSize: 12,
    color: palette.muted,
  },
  footer: {
    marginBottom: spacing.xl,
  },
});
