import React, { useEffect, useState } from "react";

import { StyleSheet, Dimensions, ScrollView, View, Text } from "react-native";
import { CardMusic } from "../../components/music/CardMusic";

import * as MediaLibrary from 'expo-media-library';

const height = Dimensions.get("window").height;

export enum PlayerStatus {
    STOPPED, PAUSED, PLAYING, NONE
}

export interface MusicProps {
    title: string;
    duration: number;
    uri: string;
    status: PlayerStatus;
    position: number;
}

export function MusicNavigator() {
    const [loading, setLoading] = useState(true);
    const [musics, setMusics] = useState<MusicProps[]>([]);

    async function requestPermissions() {
        const { granted } = await MediaLibrary.requestPermissionsAsync();
        if (!granted) {
            console.error("A permissão ao armazenamento externo não foi concedida!");
            return;
        }
        console.log("Permissão concedida!");
    }

    async function searchAllMusics() {
        const result = (await MediaLibrary.getAssetsAsync({mediaType: "audio", first: 1000})).assets;
        const filteredMusic = result.filter(music => music.uri.startsWith("file:///storage/emulated/0/Music/") &&
        music.filename.endsWith(".mp3"));

        const musics = filteredMusic.map(music => ({
            title: music.filename,
            duration: Math.floor(music.duration),
            uri: music.uri,
            status: PlayerStatus.STOPPED,
            position: 0
        }));

        setMusics(musics);
    }

    const renderMusicCard = () => {
        if (musics.length == 0) {
            return(
                <View style={{flex: 1, height: height / 1.5, justifyContent: "center", alignItems: "center"}}>
                    <Text style={{color: "white"}}>Nenhuma música encontrada na pasta</Text>
                    <Text style={{color: "white"}}>storage/emulated/0/Music/</Text>
                </View>
            );
        }

        return (
            musics.map((music) => (
                <View key={music.title}>
                    <CardMusic 
                        title={music.title}
                        duration={music.duration}
                        uri={music.uri}
                        status={music.status}
                        position={0}
                    />
                </View>
            ))
        );
      };

    useEffect(() => {
        requestPermissions();
        searchAllMusics().then(() => setLoading(false));
    }, []);

    if (loading) {
        return(
            <View style={{flex: 1, height: height, alignItems: "center", justifyContent: "center"}}>
                <Text style={{color: "white"}}>Estamos carregando todas as músicas, um momento...</Text>
            </View>
        );
    }
    
    return(
        <ScrollView style={styles.container}>
            {renderMusicCard()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#30343f",
        maxHeight: height
    }
});