
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { IconSymbol } from '@/components/IconSymbol';

interface ImageItem {
  uri: string;
  name: string;
}

export default function ImageGalleryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [uploadedImages, setUploadedImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUploadedImages();
  }, []);

  const loadUploadedImages = async () => {
    try {
      const documentsDir = FileSystem.documentDirectory;
      if (!documentsDir) {
        console.log('Documents directory not available');
        setUploadedImages([]);
        setLoading(false);
        return;
      }

      const imagesDirPath = `${documentsDir}uploaded_images/`;
      console.log('Loading images from:', imagesDirPath);

      try {
        const dirInfo = await FileSystem.getInfoAsync(imagesDirPath);
        console.log('Directory info:', dirInfo);
        
        if (!dirInfo.exists) {
          console.log('Images directory does not exist yet');
          setUploadedImages([]);
          setLoading(false);
          return;
        }

        const files = await FileSystem.readDirectoryAsync(imagesDirPath);
        console.log('Files in directory:', files.length);
        console.log('Files:', files);
        
        const imageFiles = files.filter((file) => {
          const isImage = file.endsWith('.png') ||
                         file.endsWith('.jpg') ||
                         file.endsWith('.jpeg');
          console.log(`File: ${file}, is image: ${isImage}`);
          return isImage;
        });

        console.log('Image files found:', imageFiles.length);

        const imagePaths = imageFiles.map((fileName) => {
          const uri = `${imagesDirPath}${fileName}`;
          console.log(`Mapping image: ${fileName} -> ${uri}`);
          return {
            uri,
            name: fileName,
          };
        });
        
        setUploadedImages(imagePaths);
        console.log('Loaded images successfully:', imagePaths.length);
      } catch (error) {
        console.log('Error reading directory:', error);
        console.log('Error type:', typeof error);
        setUploadedImages([]);
      }
    } catch (error) {
      console.log('Error loading images:', error);
      console.log('Error type:', typeof error);
      setUploadedImages([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imagePath: string) => {
    try {
      await FileSystem.deleteAsync(imagePath);
      const newImages = uploadedImages.filter((img) => img.uri !== imagePath);
      setUploadedImages(newImages);
      Alert.alert('Success', 'Image deleted successfully.');
      console.log('Image deleted:', imagePath);
    } catch (error) {
      console.log('Error deleting image:', error);
      Alert.alert('Error', 'Failed to delete image.');
    }
  };

  const handleImagePress = (imageData: ImageItem) => {
    Alert.alert(imageData.name, '', [
      {
        text: 'Share',
        onPress: () => Sharing.shareAsync(imageData.uri),
      },
      {
        text: 'Delete',
        onPress: () => {
          Alert.alert(
            'Delete Image',
            'Are you sure you want to delete this image?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Delete',
                onPress: () => deleteImage(imageData.uri),
                style: 'destructive',
              },
            ]
          );
        },
        style: 'destructive',
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const renderHeaderLeft = () => (
    <Pressable
      onPress={() => router.back()}
      style={styles.headerButtonContainer}
    >
      <IconSymbol name="chevron.left" color={theme.colors.primary} />
    </Pressable>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Image Gallery',
            headerLeft: renderHeaderLeft,
          }}
        />
      )}
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.dark ? '#000' : '#F2F2F7' },
        ]}
        edges={['top']}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Loading images...
            </Text>
          </View>
        ) : uploadedImages.length === 0 ? (
          <View style={styles.centerContainer}>
            <IconSymbol
              name="photo.stack"
              color={theme.colors.primary}
              size={48}
            />
            <Text
              style={[
                styles.emptyText,
                { color: theme.colors.text, marginTop: 16 },
              ]}
            >
              No images yet
            </Text>
            <Text
              style={[
                styles.emptySubtext,
                { color: theme.dark ? '#8E8E93' : '#666' },
              ]}
            >
              Upload images from your profile to see them here
            </Text>
          </View>
        ) : (
          <FlatList
            data={uploadedImages}
            renderItem={({ item }) => (
              <Pressable
                style={styles.imageContainer}
                onPress={() => handleImagePress(item)}
              >
                <Image source={{ uri: item.uri }} style={styles.image} />
                <View style={styles.imageOverlay}>
                  <IconSymbol name="ellipsis" color="#FFFFFF" size={24} />
                </View>
              </Pressable>
            )}
            keyExtractor={(item) => item.uri}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  listContent: {
    padding: 12,
  },
  columnWrapper: {
    gap: 12,
  },
  imageContainer: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonContainer: {
    padding: 6,
  },
});
