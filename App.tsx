import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, FlatList, TextInput,
  TouchableOpacity, Modal, Alert, SafeAreaView, Platform, StatusBar
} from 'react-native';
import axios from 'axios';
import { Feather } from '@expo/vector-icons';

// --- Configuração de IP ---
const API_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000/products'
  : 'http://localhost:3000/products';

interface Product {
  id: string;
  name: string;
  price: number;
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  // Lógica
  const fetchProducts = async () => {
    try {
      const response = await axios.get(API_URL);
      setProducts(response.data);
    } catch (error) {
      console.error("Erro conexão:", error);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) return;
    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/${editingProduct.id}`, { name, price });
      } else {
        await axios.post(API_URL, { name, price });
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchProducts();
    } catch (error) {
      Alert.alert("Erro", "Falha ao deletar");
    }
  };

  const openModalEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(String(product.price));
    setModalVisible(true);
  };

  const openModalCreate = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Formatação de Moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Renderização dos Itens
  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardPrice}>{formatCurrency(Number(item.price))}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => openModalEdit(item)} style={styles.actionBtn}>
          <Feather name="edit-2" size={20} color="#4F46E5" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.actionBtn, styles.deleteBtn]}>
          <Feather name="trash-2" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Meus Produtos</Text>
        <Text style={styles.headerSubtitle}>{products.length} itens cadastrados</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="shopping-bag" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Sua loja está vazia.</Text>
            <Text style={styles.emptySubText}>Clique no + para adicionar.</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={openModalCreate} activeOpacity={0.8}>
        <Feather name="plus" size={30} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Editar Produto' : 'Novo Item'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nome do Produto</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Headset Gamer"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Preço (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              placeholderTextColor="#9CA3AF"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <TouchableOpacity onPress={handleSave} style={styles.btnSave} activeOpacity={0.8}>
              <Text style={styles.btnSaveText}>Salvar Alterações</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', paddingTop: Platform.OS === 'android' ? 30 : 0 },

  // Header
  headerContainer: { paddingHorizontal: 24, paddingVertical: 20, backgroundColor: '#FFF', marginBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  // Lista
  list: { paddingHorizontal: 20, paddingBottom: 100 },

  // Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Sombras
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 4 },
  cardPrice: { fontSize: 18, fontWeight: '800', color: '#059669' },

  cardActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 8, backgroundColor: '#EEF2FF', borderRadius: 10 },
  deleteBtn: { backgroundColor: '#FEF2F2' },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#4B5563', marginTop: 16 },
  emptySubText: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },

  fab: {
    position: 'absolute', bottom: 30, right: 30,
    backgroundColor: '#4F46E5', // Azul Índigo Moderno
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8
  },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 30, minHeight: 400 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },

  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, padding: 16, fontSize: 16, color: '#111827'
  },

  btnSave: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 32 },
  btnSaveText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});