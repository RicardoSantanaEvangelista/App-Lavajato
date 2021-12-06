import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ScheduleList from '../screens/ScheduleScreens/ScheduleList';
import CreateSchedule from '../screens/ScheduleScreens/CreateSchedule';
import ScheduleDetails from '../screens/ScheduleScreens/ScheduleDetails';

const Stack = createStackNavigator();

export default function ScheduleMenuStack() {
    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator
                // initialRouteName="CreateSchedule"
                initialRouteName="ScheduleList"
                screenOptions={{
                    headerStyle: { backgroundColor: '#E37D00' }, // Header color
                    headerTintColor: '#FFFFFF', // Header text color
                }}>
                <Stack.Screen  
                    name="ScheduleList"
                    component={ScheduleList}
                    options={{ headerShown: false, title: 'Agendamentos' }}
                />
                <Stack.Screen
                    name="CreateSchedule"
                    component={CreateSchedule}
                    options={{ headerShown: false, title: 'Novo Agendamento' }}
                />
                <Stack.Screen 
                    name="ScheduleDetails"
                    component={ScheduleDetails}
                    options={{ headerShown: false, title: 'Detalhes Agendamento' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}