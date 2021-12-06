import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Ícone dos botões Editar e Excluir
import {db} from '../config/firebase';

export default function ScheduleItem(props) {

    function handleEditButton() {
        props.navigation.navigate('ScheduleDetails', { idAgendamento: props.item.id });
    }

    function handleDeletePress() {
        Alert.alert(
            "Atenção:",
            `Tem certeza que deseja excluir o agendamento do veículo "${props.item.placaVeiculo}"?`,
            [
                {
                    text: "Não",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: "Sim", onPress: () => {
                        db.collection("Agendamentos").doc(props.item.id).delete().then(() => {
                            // console.log('Documento deletado com sucesso!');
                            Alert.alert('Agendamento EXCLUÍDO com sucesso!');
                        }).catch((error) => {
                            // console.error('Erro ao tentar deletar documento de id anterior', error);
                            Alert.alert('ERRO ao tentar deletar Agendamento!');
                        });
                    }
                }
            ],
            { cancelable: false }
        );
    }
    return (
        <View style={styles.container}>
            <Text style={styles.itemTextName}>Veículo Placa: <Text style={styles.itemTextNameRed}>{props.item.placaVeiculo}</Text></Text>
            <View style={styles.itemLayoutDetail}>
                <Text style={styles.itemTextDetailTitle}>Data-Hora Agendada: </Text>
                {/* <Text style={styles.itemTextDetail}>{new Date(props.item.dataHora).toString()}</Text> */}
                <Text style={styles.itemTextDetail}>{props.item.dataHoraFormatada}</Text>
            </View>
            <View style={styles.itemLayoutDetail}>
                <Text style={styles.itemTextDetailTitle}>Serviço: </Text>
                <Text style={styles.itemTextDetail}>{props.item.idServico}</Text>
            </View>
            <View style={styles.itemLayoutDetail}>
                <Text style={styles.itemTextDetailTitle}>Preço: </Text>
                <Text style={styles.itemTextDetail}>{props.item.precoServicoFormatado}</Text>
            </View>
            <View style={styles.itemLayoutDetail}>
                <Text style={styles.itemTextDetailTitle}>Forma Pagamento: </Text>
                <Text style={styles.itemTextDetail}>{props.item.idFPagamento}</Text>
            </View>
            <View>
                <Text style={styles.itemTextDetailTitle}>Recado/Observação: </Text>
                <View style={{ flex: 1 }}>
                    <Text style={styles.itemTextDetailMultiline}>{`${props.item.obsStatus}`}</Text>
                </View>
            </View>
            <View style={styles.itemLayoutDetail}>
                <Text style={styles.itemTextDetailTitle}>Cliente/Resp.: </Text>
                <Text style={styles.itemTextDetail}>{props.item.nomeUsuario}</Text>
            </View>
            <View style={styles.itemLayoutDetail}>
                <Text style={styles.itemTextDetailTitle}>Email: </Text>
                <Text style={styles.itemTextDetail}>{props.item.emailUsuario}</Text>
            </View>
            <View style={styles.itemLayoutDetail}>
                <Text style={styles.itemTextDetailTitle}>Telefone: </Text>
                <Text style={styles.itemTextDetail}>{props.item.telefoneUsuario}</Text>
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
                    <MaterialCommunityIcons name="delete-forever" color="#FFF" size={20} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.editButton} onPress={handleEditButton}>
                    <MaterialCommunityIcons name="file-document-edit-outline" color="#FFF" size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FEF3B4',
        marginTop: 15,
        width: '100%',
        borderRadius: 10,
        padding: 5,
    },
    itemLayoutDetail: {
        flexDirection: 'row',
    },
    itemTextName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#730000',
    },
    itemTextNameRed: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'red',
    },
    itemTextDetailTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#730000',
    },
    itemTextDetail: {
        fontSize: 15,
    },
    itemTextDetailMultiline: {
        fontSize: 15,
        justifyContent: "flex-start",
        paddingHorizontal: 10,
    },
    buttonsContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'flex-end',
    },
    editButton: {
        marginLeft: 10,
        height: 30,
        backgroundColor: '#D26900',
        borderRadius: 7,
        padding: 5,
        fontSize: 12,
        elevation: 10,
        shadowOpacity: 10,
        shadowColor: '#ccc',
        alignItems: 'center'
    },
    deleteButton: {
        marginLeft: 10,
        height: 30,
        backgroundColor: '#D26900',
        borderRadius: 7,
        padding: 5,
        fontSize: 12,
        elevation: 10,
        shadowOpacity: 10,
        shadowColor: '#ccc',
        alignItems: 'center'
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});