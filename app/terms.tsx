import { Stack, router } from 'expo-router';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TermsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Terms of Service',
          headerStyle: { backgroundColor: '#E6F2F8' },
          headerTintColor: '#2c5f7a',
          headerTitleStyle: { color: '#1a1a1a', fontWeight: '600' },
          headerLeft: () => (
            <Pressable
              onPress={() => {
                console.log('Terms of Service back button pressed');
                router.back();
              }}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color="#2c5f7a" />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last updated: June 2025</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.body}>
          By purchasing or using Daily Whispers, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service. These terms constitute a legally binding agreement between you and Daily Whispers.
        </Text>

        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.body}>
          Daily Whispers is a gift-based service that delivers a curated daily inspirational quote to a nominated recipient for a period of one (1) year from the date of purchase.
        </Text>
        <Text style={styles.body}>
          This is a one-time purchase — not a subscription. You will not be charged on a recurring basis. Your purchase grants a single year of daily quote delivery for one recipient. No automatic renewals will occur.
        </Text>

        <Text style={styles.sectionTitle}>3. Payment Terms</Text>
        <Text style={styles.body}>
          All prices are displayed and charged in Australian Dollars (AUD). Payment is processed securely at the time of purchase. By completing a purchase, you authorise the charge to your nominated payment method.
        </Text>
        <Text style={styles.body}>
          <Text style={styles.bold}>No Refunds:</Text>
          {' '}All sales are final. Due to the digital nature of this service and the immediate commencement of delivery upon purchase, we do not offer refunds or exchanges. If you experience a technical issue with your purchase, please contact us and we will work to resolve it.
        </Text>

        <Text style={styles.sectionTitle}>4. Recipient Data Handling</Text>
        <Text style={styles.body}>
          To deliver the service, you will provide the name and contact details (such as email address or phone number) of your intended recipient. By providing this information, you confirm that:
        </Text>
        <Text style={styles.bullet}>• You have the recipient's consent to share their contact details with us.</Text>
        <Text style={styles.bullet}>• The recipient is aware they will receive daily messages from Daily Whispers.</Text>
        <Text style={styles.bullet}>• The contact information provided is accurate and belongs to the intended recipient.</Text>
        <Text style={styles.body}>
          Recipient data is used solely for the purpose of delivering the daily quote service. We do not sell, rent, or share recipient data with third parties for marketing purposes. Recipient data is retained for the duration of the service period and deleted thereafter, unless otherwise required by law.
        </Text>

        <Text style={styles.sectionTitle}>5. User Responsibilities</Text>
        <Text style={styles.body}>
          You agree to use Daily Whispers only for lawful purposes and in accordance with these Terms. You are responsible for:
        </Text>
        <Text style={styles.bullet}>• Providing accurate recipient information at the time of purchase.</Text>
        <Text style={styles.bullet}>• Ensuring the recipient consents to receiving daily messages.</Text>
        <Text style={styles.bullet}>• Not using the service to harass, harm, or send unsolicited communications to any person.</Text>
        <Text style={styles.bullet}>• Keeping your account credentials secure and confidential.</Text>
        <Text style={styles.body}>
          We reserve the right to suspend or terminate service without refund if we determine the service is being used in violation of these terms or in a manner that is harmful to recipients or others.
        </Text>

        <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
        <Text style={styles.body}>
          To the maximum extent permitted by applicable law, Daily Whispers and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the service.
        </Text>
        <Text style={styles.body}>
          Our total liability to you for any claim arising out of or relating to these Terms or the service shall not exceed the amount you paid for your purchase. Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so some of the above limitations may not apply to you.
        </Text>
        <Text style={styles.body}>
          Daily Whispers is provided "as is" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
        </Text>

        <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
        <Text style={styles.body}>
          We may update these Terms of Service from time to time. We will notify you of any material changes by updating the "Last updated" date at the top of this page. Your continued use of the service after changes are posted constitutes your acceptance of the revised terms.
        </Text>

        <Text style={styles.sectionTitle}>8. Contact Information</Text>
        <Text style={styles.body}>
          If you have any questions about these Terms of Service, please contact us at:
        </Text>
        <Text style={styles.contactEmail}>support@dailywhispers.app</Text>

        <View style={styles.footer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F2F8',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    padding: 4,
    marginLeft: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#5d8aa8',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c5f7a',
    marginTop: 24,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 22,
    marginBottom: 10,
  },
  bold: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  bullet: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 22,
    marginBottom: 6,
    paddingLeft: 8,
  },
  contactEmail: {
    fontSize: 14,
    color: '#5d8aa8',
    textDecorationLine: 'underline',
    marginTop: 4,
    marginBottom: 10,
  },
  footer: {
    height: 20,
  },
});
