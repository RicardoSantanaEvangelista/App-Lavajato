import * as React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { db } from '../../config/firebase';
import Separator from '../../components/Separator';
import ScheduleItem from '../../components/ScheduleItem';

export default function ScheduleList({ navigation }) {
  // Variável de estado do tipo vetor (de objetos agendamentos) inicializada vazia
  // criada com o hook useState. Ela será usada para receber o vetor montado no
  // hook useEffect (isto é, preenchida ao carregar a tela) com cada agendamento
  // vindo do banco de dados e que servirá para montar a FlatList
  const [agendamentos, setAgendamentos] = React.useState([]);

  // Variavel de estado para ativar e desativar o ActivityIndicator (ampulheta)
  const [loading, setLoading] = React.useState(true);

  // Função para formatar a data vinda do Firestore
  function formatarData(data) {
    // O parâmetro data deve ser do tipo object Date()
    // Subfunção para adicionar 1 zero à esquerda em números 
    // de mês, dia, horas, minutos, menores que 10
    function adicionaZero(numero) {
      if (numero <= 9)
        return "0" + numero;
      else
        return numero;
    }
    // Concatena DD/MM/YYYY da data após chamadas da subfunção
    let dataFormatada = adicionaZero(data.getDate().toString()) + "/" + (adicionaZero(data.getMonth() + 1).toString()) + "/" + data.getFullYear();
    // Concatena com HH:MM após chamadas da subfunção
    dataFormatada += ' ' + adicionaZero(data.getHours().toString()) + ':' + adicionaZero(data.getMinutes().toString());
    return dataFormatada;
  }

  function getAgendamentos() {
    // Traz objeto com todos os documentos agendamentos com status='agendado'
    // com o método ONSNAPSHOT que atualiza em tempo real a lista, caso haja
    // alguma exclusão/alteração remota dos agendamentos pelos usuários.

    // Antes monta uma consulta para trazer apenas os agendamentos FEITOS 
    // APENAS pelo usuário logado no aplicativo (tipoUsuario 'cliente')
    // trazendo os documentos quando o idUsuario = global.idUsuario
    let dbConsulta = db.collection('Agendamentos').where('status', '==', 'agendado').where('idUsuario', '==', global.idUsuario);

    // Porém, muda abaixo, se o usuário for tipo 'admin', e traz todos os documentos criados 
    // por todos os usuários, independentemente do idUsuario ser o do usuário logado, por 
    // isso omite, isto é, não faz a consulta where encadeada idUsuario = global.idUsuario
    if (global.tipoUsuario == 'admin') {
      dbConsulta = db.collection('Agendamentos').where('status', '==', 'agendado'); //<-- sem .where('idUsuario', '==', global.idUsuario)
    }

    dbConsulta.onSnapshot(
      result => {
        // Cria vetor vazio para receber os agendamentos
        const vetAgendamentos = [];

        // Realiza um loop para adicionar cada agendamento no vetor
        result.docs.forEach(doc => {
          // Cria uma variável para fazer a desestruturação de cada documento
          // firestore, a fim de facilitar a criação de objeto javascrit
          // com as propriedades de mesmos nomes para adicioná-lo no vetor
          const { placaVeiculo, idServico, precoServico,
            idFPagamento, status, obsStatus, idUsuario, nomeUsuario, emailUsuario,
            telefoneUsuario } = doc.data();

          // Adiciona o objeto com os dados desestruturados ao vetor
          // id do documento que não foi desestruturado
          // Como as demais propriedades do objeto são do mesmo nome
          // não precisa fazer chave:valor, o javascript entende que
          // "placaVeiculo," equivale a "placaVeiculo:placaVeiculo,"
          // Observe que a data é multiplicada por mil para converter
          // do tipo timestamp do Firestore para Date do JavaScript
          vetAgendamentos.push(
            {
              id: doc.id,
              placaVeiculo,
              dataHora: new Date(doc.data().dataHora.seconds * 1000),
              dataHoraFormatada: formatarData(new Date(doc.data().dataHora.seconds * 1000)),
              idServico,
              precoServico,
              precoServicoFormatado: 'R$ ' + doc.data().precoServico.toFixed(2).replace(".", ","),
              idFPagamento,
              status,
              obsStatus,
              idUsuario,
              nomeUsuario,
              emailUsuario,
              telefoneUsuario
            }
          );
        });

        // Depois que sai do loop com o vetor montado atribui o vetor
        // (da listagem dos agendamentos) à variavel de estado agendamentos
        // que servirá para montar os items da FlatList
        setAgendamentos(vetAgendamentos);
        // Desativa o ActivityIndicator
        setLoading(false);
      });
  }

  // função do hook useEffect será disparado toda vez ao carregar a tela e também quando
  // a variável/parâmetro navigation é alterada, isto é, toda vez que entrar nesta tela
  // redirecionada de outra (ou ela receber o foco vindo de outra aba, evento addListener).
  // Pega todos os agendamentos cadastrados no banco Firestore e seta/preenche a 
  // variável de estado (vetor de agendamentos)
  React.useEffect(() => {
    // Traz objeto com todos os documentos agendamentos com status='agendado'
    // Depois que sai do loop com o vetor montado atribui o vetor
    // (da listagem dos agendamentos) à variavel de estado agendamentos
    // que servirá para montar os items da FlatList
    getAgendamentos();

    // const unsubscribe = navigation.addListener('focus', () => {
    //   getAgendamentos();
    // });

    // return () => {
    //   unsubscribe;
    // };

    // }, [navigation]);
  }, []);

  // Função que manipula o botão Novo Agendamento
  // e redireciona para a tela CreateSchedule
  function handleNewSchedule() {
    navigation.navigate("CreateSchedule");
  }

  return (
    <View style={styles.container}>
      <Separator marginVertical={8} />

      {loading ? <ActivityIndicator size='large' color='#730000' /> : <></>}

      <TouchableOpacity style={styles.newButton} onPress={handleNewSchedule}>
        <Text style={styles.newButtonText}>Novo Agendamento</Text>
      </TouchableOpacity>

      <Separator marginVertical={6} />

      <FlatList
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}
        data={agendamentos}
        keyExtractor={(item, index) => String(index)}
        // Passa o objeto/parâmetro navigation para o componente ScheduleItem
        renderItem={({ item }) => <ScheduleItem item={item} navigation={navigation} />
        }
      />
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
  scrollContainer: {
    flex: 1,
    width: '90%'
  },
  itemsContainer: {
    flex: 1,
    marginTop: 10,
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'stretch',
    backgroundColor: '#fff'
  },
  newButton: {
    width: '50%',
    height: 40,
    backgroundColor: '#E37D00',
    padding: 5,
    borderRadius: 5,
    alignSelf: 'center'
  },
  newButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#730000',
    textAlign: 'center',
  },
});