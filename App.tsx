import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, FlatList, TextInput,
  TouchableOpacity, Modal, Alert, SafeAreaView, Platform
} from 'react-native';
import axios from 'axios';

// --- Configuração Inteligente de IP ---
// Se for Web ou iOS, usa localhost.
// Se for Android Emulator, usa 10.0.2.2 (ponte para o PC).
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

  // States do Formulário
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  // --- Funções CRUD ---

  const fetchProducts = async () => {
    try {
      console.log(`Buscando em: ${API_URL}`); // Debug para ver qual IP está usando
      const response = await axios.get(API_URL);
      setProducts(response.data);
    } catch (error) {
      console.error("Erro ao buscar:", error);
      // No Web, o Alert não funciona igual no mobile, então usamos console
      if (Platform.OS === 'web') {
        console.log("Erro de conexão. Verifique se o backend está rodando.");
      } else {
        Alert.alert("Erro", "Não foi possível conectar ao servidor");
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) return;

    try {
      if (editingProduct) {
        // Editar
        await axios.put(`${API_URL}/${editingProduct.id}`, { name, price });
      } else {
        // Criar
        await axios.post(API_URL, { name, price });
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao salvar produto");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchProducts();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao deletar");
    }
  };

  // --- Controles de UI ---

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

  // --- Renderização ---

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardPrice}>R$ {Number(item.price).toFixed(2)}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => openModalEdit(item)} style={styles.btnEdit}>
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.btnDelete}>
          <Text style={styles.btnText}>X</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Loja Virtual</Text>

      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto cadastrado.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={openModalCreate}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do produto"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Preço (ex: 150.90)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={closeModal} style={styles.btnCancel}>
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.btnSave}>
                <Text style={styles.btnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', paddingTop: Platform.OS === 'android' ? 40 : 0 },
  header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#333' },
  list: { padding: 20, paddingBottom: 100 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  cardPrice: { color: '#2ecc71', fontWeight: 'bold', fontSize: 16, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 10 },
  btnEdit: { backgroundColor: '#f1c40f', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  btnDelete: { backgroundColor: '#e74c3c', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#3498db', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  fabText: { color: '#fff', fontSize: 32, marginTop: -2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.2, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  input: { borderWidth: 1, borderColor: '#e1e1e1', backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  btnCancel: { backgroundColor: '#95a5a6', padding: 15, borderRadius: 10, flex: 1, alignItems: 'center' },
  btnSave: { backgroundColor: '#3498db', padding: 15, borderRadius: 10, flex: 1, alignItems: 'center' },
});