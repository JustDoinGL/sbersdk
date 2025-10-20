
.sms-code-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.sms-inputs-container {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.sms-input {
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: 24px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
}

.sms-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.sms-input.error {
  border-color: #dc3545;
}

.sms-input:not(:placeholder-shown) {
  border-color: #28a745;
}

.submit-button {
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-button:hover {
  background-color: #0056b3;
}

.submit-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}