import * as React from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'; // Ícone mensagem erro
import DatePicker from 'react-native-datepicker';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../config/firebase';

export default function ScheduleDetails(props) {
    // Variável de estado (objeto) usada para receber os dados dos inputs
    // e também serve para atualizar o documento agendamento no banco de dados
    const [state, setState] = React.useState({
        id: '',  // para guardar o id do documento agendamento que está sendo alterado
        placaVeiculo: '',
        data: '',
        hora: '',
        status: '',
        obsStatus: '',
        idFPagamento: '',
        idServico: '',
        precoServico: '',
        idUsuario: '',
        nomeUsuario: '',
        emailUsuario: '',
        telefoneUsuario: '',
    });

    // Variável de estado que guarda a data original do agendamento para comparar
    // Caso haja mudança da data, um novo documento com a nova data deverá ser
    // criado (se possível) e o documento da data original deverá ser excluído
    const [dataOriginal, setDataOriginal] = React.useState('');
    const [horaOriginal, setHoraOriginal] = React.useState('');

    // Variaveis de estado (vetores) que serão usadas para montar os Pickers
    // de serviços e formas de pagamento dinamicamente
    const [formasPagto, setformasPagto] = React.useState([]);
    const [servicos, setServicos] = React.useState([]);
    // Variáveis de estado simples para tratamento/mensagens de validação na tela
    // statusSaveError é usada exibir ou limpar ou não a mensagem de erro por meio
    // de renderização condicional
    // messageSaveError é usada para guardar a mensagem de erro
    const [statusSaveError, setStatusSaveError] = React.useState(false);
    const [messageSaveError, setMessageSaveError] = React.useState('');

    // Variavel de estado para ativar e desativar o ActivityIndicator (ampulheta)
    const [loading, setLoading] = React.useState(true);

    // Função para adicionar 1 zero à esquerda em números 
    // de mês, dia, horas, minutos, menores que 10
    function adicionaZero(numero) {
        if (numero <= 9)
            return "0" + numero;
        else
            return numero;
    }

    // Função para formatar data DD/MM/YY
    function formatarData(data) {
        // O parâmetro data deve ser do tipo object Date()
        // Concatena DD/MM/YYYY da data após chamadas da subfunção
        let dataFormatada = adicionaZero(data.getDate().toString()) + "/" + (adicionaZero(data.getMonth() + 1).toString()) + "/" + data.getFullYear();
        return dataFormatada;
    }

    // Função que faz uma consulta para trazer o agendamento de acordo com o seu id
    async function getAgendamento(id) {
        // Realiza a consulta com base no id recebido no parâmetro
        const doc = await db.collection('Agendamentos').doc(id).get();

        // Converte o retorno dos dados Firebase para um objeto JavaScript
        const agendamento = doc.data();
        // console.log('agendamento->', agendamento);
        let objAgendamento = {
            ...agendamento,
            id: doc.id,
            data: formatarData(new Date(doc.data().dataHora.seconds * 1000)),
            hora: adicionaZero((new Date(doc.data().dataHora.seconds * 1000)).getHours()) + ':' + adicionaZero((new Date(doc.data().dataHora.seconds * 1000)).getMinutes()),
        }
        // Guarda o estado do agendamento que irá receber alterações
        setState(objAgendamento);
        // Guarda a data e a hora original separadamente
        // Serão usadas para verificar se houve alteração de data e/ou de hora
        setDataOriginal(objAgendamento.data);
        setHoraOriginal(objAgendamento.hora);
        // Desativa o ActivityIndicator
        setLoading(false);
    }

    // Hook useEffect usado para ao renderizar/inicializar a tela trazer
    // todas os serviços e formas de pagamento disponivel=true
    // para montar o componente Picker de formas de pagamento
    // além de realizar a consulta do agendamento que será editado
    React.useEffect(() => {
        // Consulta agendamento a ser editado
        getAgendamento(props.route.params.idAgendamento);

        // Promisse que faz duas consultas paralelas no banco de dados Firestore
        // retornando dois objetos firebase e a partir deles crio um vetor
        // Os objetos são diferentes de 2 vetores puros, a contrário de como
        // se consumisse uma API com axios
        Promise.all([
            // Traz objetos com todos os documentos das duas coleções
            db.collection('FormasPagamento').where('disponivel', '==', true).get(),
            db.collection('Servicos').where('disponivel', '==', true).get()
        ]).then((results) => {
            const formasPgtoDisponiveis = results[0]; // Objeto firebase de formas pagamento disponíveis
            const servicosDisponiveis = results[1]; // Objeto firebase de serviços disponíves

            // Cria dois vetores vazios
            let vetFormasPagto = [];
            let vetServicos = [];

            // Gerando o vetor a partir do objeto retornado
            formasPgtoDisponiveis.forEach((doc) => {
                vetFormasPagto.push({ label: doc.data().descricao, value: doc.id });
            });

            // Gerando o vetor a partir do objeto retornado
            servicosDisponiveis.forEach((doc) => {
                vetServicos.push({ label: `${doc.data().descricao} (R$ ${doc.data().preco.toFixed(2).replace(".", ",")})`, value: doc.id, preco: doc.data().preco });
            });

            // Atualiza as variáveis de estado (que também são vetores) com estes
            // vetores gerados e elas vão servir para renderizar dinamicamente
            // os itens do Picker de serviços e formas de pagamento
            setformasPagto(vetFormasPagto);
            setServicos(vetServicos);
        }
        ).catch((error) => {
            // console.log('Error ->', error);
            Alert.alert(
                'ERRO',
                'Erro ao tentar obter Serviços e Formas de Pagamento!'
            );
        });
    }, []);

    // Demais variáveis de estado dos inputs sendo atualizadas a cada digitação
    const handleChangeText = (key, value) => {
        if (statusSaveError) {
            setStatusSaveError(false);
        };
        setState({ ...state, [key]: value });
    }
    // Variáveis de estado específica do input Serviço sendo atualizadas a cada digitação
    const handleChangeServico = (id, preco) => {
        if (statusSaveError) {
            setStatusSaveError(false);
        };
        setState({ ...state, idServico: id, precoServico: preco });
    }

    // Checa campos de preenchimento obrigatório
    function fieldsFilleds() {
        if (state.placaVeiculo && state.data && state.hora && state.idFPagamento && state.idServico)
            return true;
        else
            return false;
    }

    // Função Inicializa/limpa as variáveis de estado
    function LimpaVariaveisEstado() {
        setDataOriginal('');
        setHoraOriginal('');
        setState({
            placaVeiculo: '',
            data: '',
            hora: '',
            status: '',
            obsStatus: '',
            idFPagamento: '',
            servico: '',
            idUsuario: global.idUsuario,
            nomeUsuario: global.nomeUsuario,
            emailUsuario: global.emailUsuario,
            telefoneUsuario: global.telefoneUsuario,
        });
    }

    // Função que manipula o evento onPress do botão cancelar
    // e apenas volta na pilha (stack) para tela de listagem dos agendamentos
    // cancelando a criação do novo agendamento
    function cancelNewSchedule() {
        LimpaVariaveisEstado();
        props.navigation.navigate("ScheduleList");
    }

    // Função que manipula o evento onPress do botão atualizar
    // Efetivamente salva no banco de dados Firestore, caso
    // validação dos dados esteja ok
    function updateSchedule() {
        // Primeiro valida se os campos obrigatórios estão preenchidos
        if (!fieldsFilleds()) {
            // Seta as variáveis de estado de erro/validação
            setMessageSaveError('Apenas o campo "Recado/Observação" não é de \npreenchimento obrigatório!');
            setStatusSaveError(true);
        }
        else {
            // Caso contrário
            // Cria uma variável para montar a data e hora digitadas
            // para verificar se esta data e hora alteradas já está ocupada
            let dataHoraAgendamento = new Date(
                Date.parse(state.data.slice(6, 10) + '/' +
                    state.data.slice(3, 5) + '/' + state.data.slice(0, 2) + ' ' +
                    state.hora.slice(0, 2) + ':' + state.hora.slice(3, 5))
            );

            // Monta os dados que serão atualizados
            let objUpdate = {
                placaVeiculo: state.placaVeiculo,
                dataHora: dataHoraAgendamento,
                status: 'agendado',
                obsStatus: state.obsStatus,
                precoServico: state.precoServico,
                idFPagamento: state.idFPagamento,
                idServico: state.idServico,
                idUsuario: state.idUsuario,
                nomeUsuario: state.nomeUsuario,
                emailUsuario: state.emailUsuario,
                telefoneUsuario: state.telefoneUsuario,
            };

            // Verifica se houve alteração de data e hora
            // Se houve mudará o id e será outro documentop
            if ((state.data == dataOriginal) && (state.hora == horaOriginal)) {
                // Então é o mesmo documento, neste caso update ou set
                // sem precisar consultar se já existe
                db.collection('Agendamentos').doc(state.id).update(objUpdate).then(() => {
                    LimpaVariaveisEstado();
                    Alert.alert(
                        'Data/Horário Disponível',
                        'Agendamento atualizado com SUCESSO!'
                    );
                    // Redirecionamento stack para tela de listagem
                    // dos agendamentos, após atualizar o agendamento
                    props.navigation.navigate('ScheduleList');
                }).catch((error) => {
                    // console.log('error-> ', error);
                    Alert.alert(
                        'ERRO',
                        'Erro ao tentar atualizar o agendamento!'
                    );
                });
            } else {
                // Senão é outro novo documento:
                // 1) Precisa consultar para saber se está data-horário já está ocupado
                // 2) Criar o novo documento, caso não esteja ocupado
                // 3) Deletar o documento anterior para liberar vaga para outro agendar

                // 1) Consultar
                db.collection('Agendamentos').doc(dataHoraAgendamento.getTime().toString()).get()
                    .then(
                        (doc) => {
                            if (doc.exists) {
                                //console.log('Já existe um agendamento nesta data e horário', doc.data(), doc.id);
                                Alert.alert(
                                    'Data/Horário Ocupado',
                                    'Infelizmente alguém já agendou nesta data e horário!'
                                );
                            } else {
                                // 2) Criar um novo documento com outro id baseado na nova data e deleta o documento antigo
                                db.collection('Agendamentos').doc(dataHoraAgendamento.getTime().toString()).set(objUpdate).then(() => {
                                    // Após esta criação deleta o agendamento anterior, já que houve mudança de data
                                    // porque o seu id (chave primária) é a respectiva data, liberando
                                    // vaga para que outro agendamento possa ser feito no seu lugar
                                    let dataHoraOriginal = new Date(
                                        Date.parse(dataOriginal.slice(6, 10) + '/' +
                                            dataOriginal.slice(3, 5) + '/' + dataOriginal.slice(0, 2) + ' ' +
                                            horaOriginal.slice(0, 2) + ':' + horaOriginal.slice(3, 5))
                                    );
                                    db.collection("Agendamentos").doc(dataHoraOriginal.getTime().toString()).delete().then(() => {
                                        console.log('Documento deletado com sucesso!');
                                    }).catch((error) => {
                                        console.error('Erro ao tentar deletar documento de id anterior', error);
                                    });

                                    // Inicializa/limpa as variáveis de estado
                                    LimpaVariaveisEstado();
                                    Alert.alert(
                                        'Data/Horário Disponível',
                                        'Agendamento atualizado com SUCESSO!'
                                    );
                                    // Redirecionamento stack para tela de listagem
                                    // dos agendamentos, após salvar o novo agendamento
                                    props.navigation.navigate('ScheduleList');
                                })
                                    .catch((error) => {
                                        //console.log('error-> ', error);
                                        Alert.alert(
                                            'ERRO',
                                            'Erro ao tentar gravar o agendamento!'
                                        );
                                    });
                            }
                        }
                    );
            } //FIM ELSE EM CASO DE NOVO AGENDAMENTO (DATA-HORA DIFERENTES)
        }
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.titleText}>Dados Agendamento</Text>

            {loading ? <ActivityIndicator size='large' color='#730000' />:<></>}

            <View style={styles.inputView}>
                <TextInput
                    style={styles.input}
                    value={state.placaVeiculo}
                    onChangeText={(value) => handleChangeText('placaVeiculo', value)}
                    placeholder={'Placa do Veículo'}
                    placeholderTextColor='black'
                    autoCapitalize={'characters'} //Todas as letras e maiúscula
                    clearButtonMode='always' //Botão para limpar no iOS
                />
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', width: '95%', alignSelf: 'center' }}>
                <View style={styles.viewDatePicker}>
                    <DatePicker
                        style={styles.datePicker}
                        date={state.data} // Data inicial do estado
                        // placeholderTextColor='#730000'
                        //placeholderTextColor='black' 
                        placeholder='Selecione a Data'
                        mode='date' // date, datetime and time
                        format='DD/MM/YYYY'
                        minDate={new Date()}
                        // androidMode='spinner'
                        // maxDate='01/01/2050'
                        confirmBtnText='Confirmar'
                        cancelBtnText='Cancelar'
                        iconComponent={
                            <MaterialCommunityIcons
                                style={{ marginTop: 5 }}
                                size={30}
                                color='#730000'
                                name='calendar-month'
                            />
                        }
                        customStyles={{
                            dateInput: {
                                marginLeft: 0,
                                marginTop: 4,
                                height: 40,
                                width: '50%',
                                borderColor: '#FFC300',
                                borderRadius: 5,
                            },
                            placeholderText: {
                                //fontSize: 18,
                                //color: '#A97800'  // 'rgb(169, 120, 0)' 
                                color: 'black'  // 'rgb(169, 120, 0)' 
                            }
                        }}
                        onDateChange={(value) =>
                            handleChangeText('data', value)}
                    />
                </View>
                <View style={styles.viewTimePicker}>
                    <Picker
                        style={styles.inputTimePicker}
                        dropdownIconColor='#730000'
                        //prompt='Selecione a hora'
                        selectedValue={state.hora}
                        onValueChange={(value, itemIndex) =>
                            handleChangeText('hora', value)
                        }>
                        <Picker.Item label='Horário' value='' />
                        <Picker.Item label='08:00' value='08:00' />
                        <Picker.Item label='08:30' value='08:30' />
                        <Picker.Item label='09:00' value='09:00' />
                        <Picker.Item label='09:30' value='09:30' />
                        <Picker.Item label='10:00' value='10:00' />
                        <Picker.Item label='10:30' value='10:30' />
                        <Picker.Item label='11:00' value='11:00' />
                        <Picker.Item label='11:30' value='11:30' />
                        <Picker.Item label='14:00' value='14:00' />
                        <Picker.Item label='14:30' value='14:30' />
                        <Picker.Item label='15:00' value='15:00' />
                        <Picker.Item label='15:30' value='15:30' />
                        <Picker.Item label='16:00' value='16:00' />
                        <Picker.Item label='16:30' value='16:30' />
                        <Picker.Item label='17:00' value='17:00' />
                        <Picker.Item label='17:30' value='17:30' />
                    </Picker>
                </View>
            </View>
            <View style={styles.viewServicePicker}>
                <Picker
                    style={styles.inputServicePicker}
                    dropdownIconColor='#730000'
                    //prompt='Selecione a serviço'
                    selectedValue={state.idServico}
                    onValueChange={(value, itemIndex) => handleChangeServico(value, servicos[itemIndex - 1].preco)}>
                    <Picker.Item key='0' label='Selecione o Serviço' value='' />
                    {servicos.map(servico => <Picker.Item key={servico.value.id} label={servico.label} value={servico.value} />)}
                </Picker>
            </View>
            <View style={styles.viewServicePicker}>
                <Picker
                    style={styles.inputServicePicker}
                    dropdownIconColor='#730000'
                    selectedValue={state.idFPagamento}
                    onValueChange={(value, itemIndex) =>
                        handleChangeText('idFPagamento', value)
                    }>
                    <Picker.Item key='0' label='Selecione a Forma de Pagamento' value='' />
                    {formasPagto.map(forma => <Picker.Item key={forma.value} label={forma.label} value={forma.value} />)}
                </Picker>
            </View>
            <View style={styles.inputView}>
                <TextInput
                    style={styles.inputMultiline}
                    placeholder={'Recado/Observação'}
                    placeholderTextColor='black'
                    multiline={true}
                    maxLength={300}
                    value={state.obsStatus}
                    onChangeText={(value) => handleChangeText('obsStatus', value)}
                    clearButtonMode='always' //Botão para limpar no iOS
                />
            </View>

            {statusSaveError === true
                ?
                <View style={styles.contentAlert}>
                    <MaterialIcons
                        name='mood-bad'
                        size={24}
                        color='black'
                    />
                    <Text style={styles.warningAlert}>{messageSaveError}</Text>
                </View>
                :
                <View></View>
            }
            {/* <Separator marginVertical={5} /> */}

            <View style={styles.inputButtonsView}>
                <TouchableOpacity style={styles.saveButton} onPress={cancelNewSchedule}>
                    <Text style={styles.saveButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={updateSchedule}>
                    <Text style={styles.saveButtonText}>Atualizar</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFC300',
    },
    titleText: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#730000',
        textAlign: 'center',
        margin: 20,
    },
    inputButtonsView: {
        marginTop: 5,
        width: '95%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    saveButton: {
        marginLeft: 20,
        width: '45%',
        height: 40,
        backgroundColor: '#E37D00',
        padding: 5,
        borderRadius: 5,
    },
    saveButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#730000',
        textAlign: 'center',
    },
    inputView: {
        flex: 1,
        padding: 0,
        marginBottom: 5,
        alignItems: 'center',
    },
    input: {
        width: '95%',
        height: 45,
        padding: 10,
        borderWidth: 1,
        borderColor: '#730000',
        borderRadius: 5,
        marginBottom: 10,
    },
    inputMultiline: {
        width: '95%',
        height: 120,
        padding: 10,
        borderWidth: 1,
        borderColor: '#730000',
        borderRadius: 5,
        marginBottom: 10,
        textAlign: 'justify'
    },
    viewTimePicker: {
        borderWidth: 1,
        borderColor: '#730000',
        width: '45%',
        height: 45,
        alignSelf: 'center',
        borderRadius: 5,
        marginLeft: 19,
        marginBottom: 15,
    },
    inputTimePicker: {
        width: '100%',
        height: 44,
        transform: [ // Para ajustar o tamanho da fonte
            { scaleX: 0.9 },
            { scaleY: 0.9 },
        ],
    },
    viewDatePicker: {
        width: '50%',
        height: 45,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#730000',
        paddingHorizontal: 8,
    },
    datePicker: {
        width: '100%',
        height: 40,
    },
    viewServicePicker: {
        borderWidth: 1,
        borderColor: '#730000',
        width: '95%',
        height: 45,
        alignSelf: 'center',
        borderRadius: 5,
        marginBottom: 15,
    },
    inputServicePicker: {
        width: '100%',
        height: 44,
        transform: [ // Para ajustar o tamanho da fonte
            { scaleX: 0.9 },
            { scaleY: 0.9 },
        ],
    },
    textSimple: {
        color: '#730000',
        width: '95%',
        textAlign: 'justify',
    },
    warningAlert: {
        paddingLeft: 2,
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    contentAlert: {
        // marginTop: 5,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
});