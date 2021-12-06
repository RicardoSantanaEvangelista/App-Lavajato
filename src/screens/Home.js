import * as React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Separator from '../components/Separator';
import { FontAwesome5 } from '@expo/vector-icons'; // Ícone mensagem erro

export default function Home({ navigation, route }) {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Lava a Jato G&G!</Text>
      <Image
        style={styles.imgLogo}
        source={require('../../assets/car_washing_320.png')}
      />

      <Text style={styles.helloText}>Olá {route.params?.name},</Text>
      <Text style={styles.helloText}>Seja bem-vindo(a)!</Text>

      <Separator marginVertical={10} />

      <Text style={styles.helloText}>Não perca tempo e agende agora</Text>
      <View style={styles.contentAlert}>
        <Text style={styles.helloText}>a lavagem do seu carro </Text>
        <View style={styles.contentAlert}></View>
        <FontAwesome5
          name='smile-wink'
          size={24}
          color='#730000'
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC300',
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 40,
    color: '#730000',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  helloText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#730000',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  imgLogo: {
    marginBottom: 0
  },
  contentAlert: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});