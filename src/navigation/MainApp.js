import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BottomTabs from './BottomTabs';
import ExploreScreen from '../screens/ExploreScreen';
import HomeScreen from '../screens/HomeScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StylistScreen from '../screens/StylistScreen';
import { layout } from '../styles/layout';
import { colors } from '../theme/colors';
import { useAppState } from '../state/AppContext';

export default function MainApp() {
  const [active, setActive] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { notice, setNotice } = useAppState();

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 2600);
    return () => clearTimeout(timer);
  }, [notice, setNotice]);

  const navigate = (tab) => {
    setSelectedProduct(null);
    setActive(tab);
  };

  const openProduct = (product, sourceTab = active) => {
    setActive(sourceTab);
    setSelectedProduct(product);
  };

  const content = useMemo(() => {
    if (selectedProduct) {
      return (
        <ProductDetailScreen
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onOrderCreated={() => {
            setSelectedProduct(null);
            setActive('orders');
          }}
        />
      );
    }

    if (active === 'explore') {
      return <ExploreScreen onProductPress={(product) => openProduct(product, 'explore')} />;
    }
    if (active === 'quiz') {
      return <StylistScreen onNavigate={navigate} onProductPress={(product) => openProduct(product, 'quiz')} />;
    }
    if (active === 'orders') return <OrdersScreen onNavigate={navigate} />;
    if (active === 'profile') return <ProfileScreen onNavigate={navigate} />;
    return <HomeScreen onNavigate={navigate} onProductPress={(product) => openProduct(product, 'home')} />;
  }, [active, selectedProduct]);

  return (
    <View style={layout.appFrame}>
      <View style={layout.appContent}>{content}</View>
      <BottomTabs active={active} onChange={navigate} />
      {!!notice && (
        <Pressable style={styles.notice} onPress={() => setNotice(null)}>
          <Text style={styles.noticeText}>{notice}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 100,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.forest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6
  },
  noticeText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center'
  }
});
