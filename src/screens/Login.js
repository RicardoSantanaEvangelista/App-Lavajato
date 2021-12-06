import * as React from 'react';
import { View, KeyboardAvoidingView, Text, TouchableOpacity, TextInput, StyleSheet, Image, Platform, ActivityIndicator } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons'; // Ícones inputs e mensagem erro
import Separator from '../components/Separator';
import firebase, { db } from '../config/firebase';
// ATENÇÃO: Se com o uso do firebase aparecer constantemente a warning
// "Setting a timer for a long period of time..."
// Corrija esse problema seguindo os passos:
// Navegue até o arquivo node_modules /react-native /Libraries/Core/Timers/JSTimers.js
// Procure a variável MAX_TIMER_DURATION_MS
// Altere se valor de 60 * 1000 para 10000 * 1000
// Salve as alterações e reinicie

export default function Login({ navigation, route }) {
  const [state, setState] = React.useState({
    email: '',
    password: '',
  });

  const [passwordSecured, setPasswordSecured] = React.useState(true);
  const [statusLoginError, setStatusLoginError] = React.useState(false);
  const [messageLoginError, setMessageLoginError] = React.useState('');

  // Variavel de estado para ativar e desativar o ActivityIndicator (ampulheta)
  const [loading, setLoading] = React.useState(false);

  // Variáveis de estado dos inputs sendo atualizadas a cada digitação
  const handleChangeText = (key, value) => {
    if (statusLoginError) {
      setStatusLoginError(false);
    }
    setState({ ...state, [key]: value });
  }

  // Função do botão "Cadastre-se", a fim de navegar
  // para se registrar no caso de novo usuário
  function handleRegister() {
    setState({ email: '', senha: '' });
    navigation.navigate('Register'); //Navega em pilha para tela Register
  }

  // Checa campos de preenchimento obrigatório
  function requiredFields() {
    if (!state.email || !state.password) {
      return false;
    }
    else
      return true;
  }

  function loginFirebase() {
    if (!requiredFields()) {
      setMessageLoginError('Todos os campos são de \npreenchimento obrigatório!');
      setStatusLoginError(true);
    } else {
      setLoading(true);
      firebase.auth().signInWithEmailAndPassword(state.email, state.password)
        .then((userCredential) => {
          // Limpa variáveis de estado/inputs
          setState({ email: '', senha: '' });

          // Realiza uma consulta à coleção Perfis e monta as variáveis globais do 
          // usuário que acabou de logar, a fim de usar seus dados em outras telas
          db.collection('Perfis').doc(userCredential.user.uid).get()
            .then((dadosPerfil) => {
              global.idUsuario = userCredential.user.uid;
              global.nomeUsuario = dadosPerfil.data().nome;
              global.emailUsuario = dadosPerfil.data().email;
              global.telefoneUsuario = dadosPerfil.data().telefone;
              global.tipoUsuario = dadosPerfil.data().tipoUsuario;
            });
          setLoading(false);
          // Vai para a tela Home (e não volta mais para login), replace esvazia a pilha/stack
          navigation.replace('HomeMenuBottomTab', {
            screen: 'Home',
            params: { uid: userCredential.user.uid, name: userCredential.user.displayName, email: userCredential.user.email }
          });
        })
        .catch((error) => {
          //console.log(error.code);
          //console.log(error.message);
          switch (error.code) {
            case 'auth/wrong-password':
              setMessageLoginError('"Senha" inválida!');
              break;
            case 'auth/user-not-found':
              setMessageLoginError('"E-mail" (Usuário) não cadastrado!');
              break;
            case 'auth/too-many-requests':
              setMessageLoginError('Bloqueio temporário. Várias tentativas\ncom senha inválida. Tente mais tarde!');
              break;
            case 'auth/user-disabled':
              setMessageLoginError('Conta de e-mail desativada. Contacte\no administrador do sistema!');
              break;
            default:
              setMessageLoginError('"Email" e/ou "Senha" inválidos!');

          }
          setStatusLoginError(true);
          setLoading(false);
        });
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.titleText}>Lava a Jato G&G</Text>

      <Image
        style={styles.imgLogo}
        source={require('../../assets/car_washing.png')}
      />

      {loading ? <ActivityIndicator size='large' color='#730000' /> : <></>}

      <View style={styles.inputView}>
        <MaterialIcons name="email" size={24} color="#730000" />
        <TextInput
          style={styles.input}
          value={state.email}
          onChangeText={(value) => handleChangeText('email', value)}
          placeholder={'E-mail'}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputView}>
        <FontAwesome name="lock" size={24} color="#730000" />
        <TextInput
          style={styles.input}
          value={state.password}
          secureTextEntry={passwordSecured}
          placeholder={'Senha'}
          textContentType="password"
          autoCapitalize="none"
          onChangeText={(value) => handleChangeText('password', value)}
        />
        <TouchableOpacity
          style={styles.touchableIcon}
          onPress={() => setPasswordSecured(!passwordSecured)}>
          {passwordSecured ? (
            <FontAwesome name="eye" type="font-awesome" size={20} color='#730000' />
          ) : (
            <FontAwesome name="eye-slash" type="font-awesome" size={20} color='#730000' />
          )}
        </TouchableOpacity>
      </View>

      {statusLoginError === true
        ?
        <View style={styles.contentAlert}>
          <MaterialIcons
            name='mood-bad'
            size={24}
            color='black'
          />
          <Text style={styles.warningAlert}>{messageLoginError}</Text>
        </View>
        :
        <View></View>
      }

      <Separator marginVertical={10} />

      <TouchableOpacity style={styles.loginButton} onPress={loginFirebase}>
        <Text style={styles.loginButtonText}>Entrar</Text>
      </TouchableOpacity>

      <Separator marginVertical={15} />

      <Text style={styles.textSimple}>É novo por aqui?</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}>
        <Text style={styles.buttonText}>Cadastre-se</Text>
      </TouchableOpacity>

      <Separator marginVertical={30} />

    </KeyboardAvoidingView>
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
  button: {
    backgroundColor: '#E37D00',
    padding: 5,
    borderRadius: 5,
  },
  loginButton: {
    width: '50%',
    height: 40,
    backgroundColor: '#E37D00',
    padding: 5,
    borderRadius: 5,
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#730000',
    textAlign: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#730000',
    textAlign: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputView: {
    marginTop: 20,
    width: '95%',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#730000',
    paddingHorizontal: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  touchableIcon: {
    padding: 4,
  },
  textSimple: {
    color: '#730000',
  },
  textSimpleJustify: {
    color: '#730000',
    width: '95%',
    textAlign: 'justify',
  },
  imgLogo: {
    marginBottom: 10
  },
  warningAlert: {
    paddingLeft: 2,
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentAlert: {
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
