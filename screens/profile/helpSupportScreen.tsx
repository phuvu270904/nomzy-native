import { FAQ, faqsApi } from "@/api/faqsApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HelpSupportScreen = () => {
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await faqsApi.getFAQs("user");
      setFaqs(data.filter((faq) => faq.isActive && faq.status === "replied"));
    } catch (err: any) {
      console.error("Error fetching FAQs:", err);
      setError(err.response?.data?.message || "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!question.trim()) {
      Alert.alert("Error", "Please enter your question");
      return;
    }

    try {
      setSubmitting(true);
      await faqsApi.submitQuestion({
        question: question.trim(),
        type: "user",
      });
      Alert.alert(
        "Success",
        "Your question has been submitted. We'll get back to you soon!",
        [
          {
            text: "OK",
            onPress: () => {
              setModalVisible(false);
              setQuestion("");
            },
          },
        ]
      );
    } catch (err: any) {
      console.error("Error submitting question:", err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to submit question. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

    const handleBack = () => {
        router.back();
    };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Help & Support</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22C55E" />
          <Text style={styles.loadingText}>Loading FAQs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Help & Support</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF4757" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchFAQs}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Contact Support Card */}
        <View style={styles.contactCard}>
          <View style={styles.contactIconContainer}>
            <Ionicons name="headset-outline" size={32} color="#22C55E" />
          </View>
          <Text style={styles.contactTitle}>Need More Help?</Text>
          <Text style={styles.contactDescription}>
            Can't find what you're looking for? Our support team is here to help.
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="mail-outline" size={20} color="#FFF" />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          {faqs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="help-circle-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No FAQs available</Text>
            </View>
          ) : (
            faqs.map((faq, index) => (
              <TouchableOpacity
                key={faq.id}
                style={[
                  styles.faqItem,
                  index === faqs.length - 1 && styles.lastFaqItem,
                ]}
                onPress={() => toggleExpand(faq.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <View style={styles.faqIconContainer}>
                    <Ionicons
                      name="help-circle-outline"
                      size={24}
                      color="#22C55E"
                    />
                  </View>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons
                    name={
                      expandedId === faq.id
                        ? "chevron-up-outline"
                        : "chevron-down-outline"
                    }
                    size={24}
                    color="#999"
                  />
                </View>
                {expandedId === faq.id && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Question Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ask a Question</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setQuestion("");
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Can't find the answer you're looking for? Ask us a question and we'll get back to you soon.
            </Text>

            <TextInput
              style={styles.questionInput}
              placeholder="Type your question here..."
              placeholderTextColor="#999"
              value={question}
              onChangeText={setQuestion}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />

            <Text style={styles.characterCount}>{question.length}/500</Text>

            <TouchableOpacity
              style={[
                styles.submitButton,
                submitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitQuestion}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#FFF" />
                  <Text style={styles.submitButtonText}>Submit Question</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FF4757",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#22C55E",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  contactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  contactDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22C55E",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  faqSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999",
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingVertical: 16,
  },
  lastFaqItem: {
    borderBottomWidth: 0,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  faqIconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    lineHeight: 22,
  },
  faqAnswerContainer: {
    marginTop: 12,
    marginLeft: 44,
    paddingRight: 24,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  modalDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 20,
  },
  questionInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  characterCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 8,
    marginBottom: 20,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22C55E",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HelpSupportScreen;
