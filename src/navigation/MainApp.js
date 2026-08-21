/**
 * @file MainApp.js
 * @description Root in-app navigator for CIRCULAI.
 *
 * Implements a custom tab + stack navigation system without react-navigation,
 * keeping the bundle slim and navigation logic fully under our control.
 *
 * Tabs are lazily mounted and kept alive (hidden with `display: none`) so
 * users return to their exact scroll position when switching tabs.
 * Stack screens (product detail, cart, payment, etc.) render on top via
 * absolute positioning and are unmounted when navigating away.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  InteractionManager,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomTabs from './BottomTabs';
import ExploreScreen from '../screens/ExploreScreen';
import HomeScreen from '../screens/HomeScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StylistScreen from '../screens/StylistScreen';
import CustomDesignScreen from '../screens/CustomDesignScreen';
import CustomizationScreen from '../screens/CustomizationScreen';
import CartScreen from '../screens/CartScreen';
import AddressScreen from '../screens/AddressScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import TailorChatScreen from '../screens/TailorChatScreen';
import ReturnRequestScreen from '../screens/ReturnRequestScreen';
import ExchangeScreen from '../screens/ExchangeScreen';
import ImpactDashboardScreen from '../screens/ImpactDashboardScreen';
import AuthModal from '../components/AuthModal';
import { TOAST_FADE_IN_MS, TOAST_FADE_OUT_MS, TOAST_VISIBLE_DURATION_MS, TAB_PRELOAD_INTERVAL_MS } from '../config/constants';
import { layout } from '../styles/layout';
import { colors, shadows } from '../theme/colors';
import { useAppState } from '../state/AppContext';

const MAIN_TABS = ['home', 'explore', 'quiz', 'impact', 'profile'];
const MemoHomeScreen = React.memo(HomeScreen);
const MemoExploreScreen = React.memo(ExploreScreen);
const MemoStylistScreen = React.memo(StylistScreen);
const MemoOrdersScreen = React.memo(OrdersScreen);
const MemoProfileScreen = React.memo(ProfileScreen);
const MemoImpactScreen = React.memo(ImpactDashboardScreen);

function getRouteKey(route) {
  const params = route.params ?? {};
  return [
    route.name,
    params.wishlistOnly ? 'wishlist' : '',
    params.product?.id ?? '',
    params.orderId ?? params.order?.id ?? '',
    params.focusedOrderId ?? '',
    params.address?.id ?? '',
    params.tailorName ?? params.product?.tailor ?? params.order?.tailor ?? '',
  ].join('|');
}

export default function MainApp() {
  const insets = useSafeAreaInsets();
  const [route, setRoute] = useState({ name: 'home', params: {} });
  const routeRef = useRef(route);
  const historyRef = useRef([]);
  const screenBackHandlerRef = useRef(null);
  const [mountedTabs, setMountedTabs] = useState(() => new Set(['home']));
  const { notice, setNotice, authModalConfig, closeAuthModal, createMidtransPayment, selectedAddress, addresses, isLoggedIn, openAuthModal } = useAppState();
  const active = route.name;
  const showTabs = MAIN_TABS.includes(active);

  // Toast animation
  const toastOpacity = React.useRef(new Animated.Value(0)).current;
  const toastTranslateY = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!notice) return undefined;

    Animated.parallel([
      Animated.spring(toastTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 18,
        bounciness: 4,
      }),
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: TOAST_FADE_IN_MS,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: TOAST_FADE_OUT_MS,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 10,
          duration: TOAST_FADE_OUT_MS,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setNotice(null);
        toastTranslateY.setValue(20);
      });
    }, TOAST_VISIBLE_DURATION_MS);

    return () => clearTimeout(timer);
  }, [notice, setNotice, toastOpacity, toastTranslateY]);

  const ensureTabMounted = useCallback((name) => {
    if (!MAIN_TABS.includes(name)) return;
    setMountedTabs((current) => {
      if (current.has(name)) return current;
      const next = new Set(current);
      next.add(name);
      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer;
    const tabsToPreload = MAIN_TABS.filter((name) => name !== 'home');
    const task = InteractionManager.runAfterInteractions(() => {
      const mountNextTab = () => {
        if (cancelled) return;
        const nextTab = tabsToPreload.shift();
        if (!nextTab) return;
        ensureTabMounted(nextTab);
        timer = setTimeout(mountNextTab, TAB_PRELOAD_INTERVAL_MS);
      };

      mountNextTab();
    });

    return () => {
      cancelled = true;
      task.cancel?.();
      clearTimeout(timer);
    };
  }, [ensureTabMounted]);

  const navigate = useCallback((name, params = {}) => {
    const nextRoute = { name, params };
    if (getRouteKey(routeRef.current) === getRouteKey(nextRoute)) return;

    ensureTabMounted(name);
    screenBackHandlerRef.current = null;
    historyRef.current.push(routeRef.current);
    routeRef.current = nextRoute;
    setRoute(nextRoute);
  }, [ensureTabMounted]);

  const replaceRoute = useCallback((name, params = {}) => {
    const nextRoute = { name, params };
    screenBackHandlerRef.current = null;
    routeRef.current = nextRoute;
    setRoute(nextRoute);
  }, []);

  const goBack = useCallback(() => {
    const previousRoute = historyRef.current.pop();
    const fallbackRoute = routeRef.current.name === 'home' ? null : { name: 'home', params: {} };
    const nextRoute = previousRoute ?? fallbackRoute;

    if (!nextRoute) return false;
    screenBackHandlerRef.current = null;
    routeRef.current = nextRoute;
    setRoute(nextRoute);
    return true;
  }, []);

  const openProduct = useCallback((product) => {
    navigate('product-detail', { product });
  }, [navigate]);

  const trackOrder = useCallback((orderId) => {
    navigate('order-tracking', { orderId });
  }, [navigate]);

  const openReturnRequest = useCallback((orderId) => {
    navigate('return-request', { orderId });
  }, [navigate]);

  const openTailorChat = useCallback((tailorName, context = {}) => {
    navigate('tailor-chat', { tailorName, ...context });
  }, [navigate]);

  const openExchange = useCallback(() => {
    navigate('exchange');
  }, [navigate]);

  const handlePayOrder = useCallback(async (order) => {
    if (!order) return;
    try {
      const payment = await createMidtransPayment(order.id);
      if (payment?.redirectUrl) {
        setNotice(`Membuka Midtrans untuk pesanan ${order.id}...`);
        await Linking.openURL(payment.redirectUrl);
        return;
      }
    } catch {
      // ignore
    }
    const targetAddress = order.address ?? selectedAddress ?? addresses?.[0];
    if (targetAddress) {
      navigate('payment', { address: targetAddress, orderId: order.id });
    } else {
      navigate('order-tracking', { orderId: order.id });
    }
  }, [addresses, createMidtransPayment, navigate, selectedAddress, setNotice]);

  const chatFromOrder = useCallback((order) => {
    const tailorName = order.tailorProfiles?.[0]?.name ?? order.tailorProfile?.name ?? order.tailor;
    openTailorChat(tailorName, { order });
  }, [openTailorChat]);

  const chatFromTailor = useCallback((tailor) => {
    openTailorChat(tailor.name);
  }, [openTailorChat]);

  const handleFocusedOrder = useCallback(() => {
    replaceRoute('orders');
  }, [replaceRoute]);

  const registerScreenBackHandler = useCallback((handler) => {
    screenBackHandlerRef.current = handler;
    return () => {
      if (screenBackHandlerRef.current === handler) {
        screenBackHandlerRef.current = null;
      }
    };
  }, []);

  const handleHardwareBack = useCallback(() => {
    if (screenBackHandlerRef.current?.()) return true;
    return goBack();
  }, [goBack]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => subscription.remove();
  }, [handleHardwareBack]);

  const stackContent = useMemo(() => {
    const params = route.params ?? {};

    if (active === 'product-detail' && params.product) {
      return (
        <ProductDetailScreen
          product={params.product}
          onBack={goBack}
          onCustomize={(initial) => {
            navigate('customization', { product: params.product, initial });
          }}
          onChat={() => openTailorChat(params.product.tailor, { product: params.product })}
        />
      );
    }
    if (active === 'customization' && params.product) {
      return (
        <CustomizationScreen
          product={params.product}
          initial={params.initial}
          onBack={goBack}
          onGoCart={() => navigate('cart')}
        />
      );
    }
    if (active === 'cart') {
      return <CartScreen onBack={goBack} onExplore={() => navigate('explore')} onContinue={() => navigate('address')} />;
    }
    if (active === 'address') {
      if (!isLoggedIn) {
        openAuthModal('Silakan masuk ke akun CIRCULAI untuk memilih alamat & membuat pesanan.');
        return null;
      }
      return <AddressScreen onBack={goBack} onContinue={(address) => navigate('payment', { address })} />;
    }
    if (active === 'profile-addresses') {
      return <AddressScreen mode="manage" onBack={goBack} />;
    }
    if (active === 'payment' && params.address) {
      if (!isLoggedIn) {
        openAuthModal('Silakan masuk ke akun CIRCULAI untuk menyelesaikan pembayaran.');
        return null;
      }
      return (
        <PaymentScreen
          address={params.address}
          onBack={goBack}
          onComplete={(order) => navigate('order-confirmation', { order })}
        />
      );
    }
    if (active === 'order-confirmation' && params.order) {
      return (
        <OrderConfirmationScreen
          order={params.order}
          onTrack={(orderId) => navigate('order-tracking', { orderId })}
          onOrders={() => navigate('orders')}
        />
      );
    }
    if (active === 'order-tracking' && params.orderId) {
      return (
        <OrderTrackingScreen
          orderId={params.orderId}
          onBack={goBack}
          onViewDetails={(order) => {
            navigate('orders', { focusedOrderId: order.id });
          }}
          onChatTailor={(tailorName, order) => openTailorChat(tailorName, { order })}
          onRequestReturn={openReturnRequest}
          onPayOrder={handlePayOrder}
        />
      );
    }
    if (active === 'return-request' && params.orderId) {
      return (
        <ReturnRequestScreen
          orderId={params.orderId}
          onBack={goBack}
        />
      );
    }
    if (active === 'tailor-chat' && params.tailorName) {
      return (
        <TailorChatScreen
          tailorName={params.tailorName}
          product={params.product}
          order={params.order}
          onBack={goBack}
        />
      );
    }

    if (active === 'custom-design') {
      return (
        <CustomDesignScreen
          onBack={goBack}
          onAddedToCart={() => navigate('cart')}
          registerBackHandler={registerScreenBackHandler}
        />
      );
    }
    if (active === 'exchange') {
      return <ExchangeScreen onBack={goBack} />;
    }
    return null;
  }, [active, goBack, handlePayOrder, navigate, openReturnRequest, openTailorChat, registerScreenBackHandler, route.params]);

  const tabParams = route.params ?? {};

  return (
    <View style={layout.appFrame}>
      <View style={layout.appContent}>
        {mountedTabs.has('home') && (
          <View
            pointerEvents={active === 'home' ? 'auto' : 'none'}
            style={[styles.screenLayer, active !== 'home' && styles.screenHidden]}
          >
            <MemoHomeScreen
              isActive={active === 'home'}
              onNavigate={navigate}
              onProductPress={openProduct}
              onTailorPress={chatFromTailor}
              onExchange={openExchange}
            />
          </View>
        )}

        {mountedTabs.has('explore') && (
          <View
            pointerEvents={active === 'explore' ? 'auto' : 'none'}
            style={[styles.screenLayer, active !== 'explore' && styles.screenHidden]}
          >
            <MemoExploreScreen
              wishlistOnly={active === 'explore' && tabParams.wishlistOnly === true}
              onBack={goBack}
              onNavigate={navigate}
              onProductPress={openProduct}
            />
          </View>
        )}

        {mountedTabs.has('quiz') && (
          <View
            pointerEvents={active === 'quiz' ? 'auto' : 'none'}
            style={[styles.screenLayer, active !== 'quiz' && styles.screenHidden]}
          >
            <MemoStylistScreen
              isActive={active === 'quiz'}
              onBack={goBack}
              onNavigate={navigate}
              onProductPress={openProduct}
              registerBackHandler={registerScreenBackHandler}
            />
          </View>
        )}

        {mountedTabs.has('orders') && (
          <View
            pointerEvents={active === 'orders' ? 'auto' : 'none'}
            style={[styles.screenLayer, active !== 'orders' && styles.screenHidden]}
          >
            <MemoOrdersScreen
              onNavigate={navigate}
              onTrackOrder={trackOrder}
              onChatTailor={chatFromOrder}
              onRequestReturn={openReturnRequest}
              onPayOrder={handlePayOrder}
              focusedOrderId={active === 'orders' ? tabParams.focusedOrderId : undefined}
              onFocusedOrderHandled={handleFocusedOrder}
            />
          </View>
        )}

        {mountedTabs.has('impact') && (
          <View
            pointerEvents={active === 'impact' ? 'auto' : 'none'}
            style={[styles.screenLayer, active !== 'impact' && styles.screenHidden]}
          >
            <MemoImpactScreen
              onNavigate={navigate}
            />
          </View>
        )}

        {mountedTabs.has('profile') && (
          <View
            pointerEvents={active === 'profile' ? 'auto' : 'none'}
            style={[styles.screenLayer, active !== 'profile' && styles.screenHidden]}
          >
            <MemoProfileScreen onNavigate={navigate} onExchange={openExchange} />
          </View>
        )}

        {!!stackContent && <View style={styles.screenLayer}>{stackContent}</View>}
      </View>
      {showTabs && <BottomTabs active={active} onChange={navigate} />}

      {/* ─── Premium toast notification ─────────────────────────────── */}
      {!!notice && (
        <Pressable
          style={[styles.toastWrapper, { bottom: (showTabs ? 84 : 20) + insets.bottom }]}
          onPress={() => setNotice(null)}
        >
          <Animated.View
            style={[
              styles.toast,
              {
                opacity: toastOpacity,
                transform: [{ translateY: toastTranslateY }],
              },
            ]}
          >
            <View style={styles.toastIcon}>
              <Feather name="check-circle" size={16} color={colors.success} />
            </View>
            <Text style={styles.toastText}>{notice}</Text>
            <Feather name="x" size={14} color="rgba(255,255,255,0.60)" />
          </Animated.View>
        </Pressable>
      )}

      {/* ─── Auth Modal ──────────────────────────────────────────────── */}
      <AuthModal
        visible={authModalConfig?.visible ?? false}
        message={authModalConfig?.message}
        onClose={closeAuthModal}
        onSuccess={() => {
          if (authModalConfig?.onSuccess) {
            authModalConfig.onSuccess();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  screenHidden: {
    display: 'none',
  },
  toastWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 18,
    backgroundColor: colors.charcoal,
    width: '100%',
    ...shadows.xl,
  },
  toastIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(79,138,91,0.20)',
  },
  toastText: {
    flex: 1,
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
