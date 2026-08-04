package com.simpolette.dcv.DcvServerApplication.features.admin;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.*;

@Service
public class KeycloakAdminClient {

    private final RestClient restClient;

    @Value("${keycloak.admin.server-url:http://localhost:8080}")
    private String serverUrl;

    @Value("${keycloak.admin.realm:vdt}")
    private String realm;

    @Value("${keycloak.admin.client-id:vdt-api}")
    private String clientId;

    @Value("${keycloak.admin.client-secret:vdt-api-secret-key-12345}")
    private String clientSecret;

    public KeycloakAdminClient() {
        this.restClient = RestClient.builder().build();
    }

    @SuppressWarnings("unchecked")
    public String getAdminAccessToken() {
        String tokenUrl = String.format("%s/realms/%s/protocol/openid-connect/token", serverUrl, realm);

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "client_credentials");
        formData.add("client_id", clientId);
        formData.add("client_secret", clientSecret);

        Map<String, Object> response = restClient.post()
                .uri(tokenUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formData)
                .retrieve()
                .body(Map.class);

        if (response != null && response.containsKey("access_token")) {
            return (String) response.get("access_token");
        }
        throw new IllegalStateException("Failed to obtain Keycloak admin access token");
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> listUsers() {
        String token = getAdminAccessToken();
        String url = String.format("%s/admin/realms/%s/users", serverUrl, realm);

        List<Map<String, Object>> users = restClient.get()
                .uri(url)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(List.class);

        return users != null ? users : List.of();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getUser(String userId) {
        String token = getAdminAccessToken();
        String url = String.format("%s/admin/realms/%s/users/%s", serverUrl, realm, userId);

        return restClient.get()
                .uri(url)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(Map.class);
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getUserRoles(String userId) {
        String token = getAdminAccessToken();
        String url = String.format("%s/admin/realms/%s/users/%s/role-mappings/realm", serverUrl, realm, userId);

        List<Map<String, Object>> roles = restClient.get()
                .uri(url)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(List.class);

        return roles != null ? roles : List.of();
    }

    @SuppressWarnings("unchecked")
    public String createUser(String username, String email, String password, String firstName, String lastName, String roleName) {
        String token = getAdminAccessToken();
        String url = String.format("%s/admin/realms/%s/users", serverUrl, realm);

        Map<String, Object> userBody = new HashMap<>();
        userBody.put("username", username);
        userBody.put("email", email);
        userBody.put("firstName", firstName != null ? firstName : "");
        userBody.put("lastName", lastName != null ? lastName : "");
        userBody.put("enabled", true);

        Map<String, Object> credential = new HashMap<>();
        credential.put("type", "password");
        credential.put("value", password);
        credential.put("temporary", false);
        userBody.put("credentials", List.of(credential));

        var responseEntity = restClient.post()
                .uri(url)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .body(userBody)
                .toBodilessEntity();

        if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getHeaders().getLocation() != null) {
            String location = responseEntity.getHeaders().getLocation().toString();
            String userId = location.substring(location.lastIndexOf('/') + 1);

            if (roleName != null && !roleName.isBlank()) {
                assignRoleToUser(userId, roleName);
            }
            return userId;
        }

        // If location header was missing, fetch user by username
        List<Map<String, Object>> found = restClient.get()
                .uri(url + "?username=" + username)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(List.class);

        if (found != null && !found.isEmpty()) {
            String userId = (String) found.get(0).get("id");
            if (roleName != null && !roleName.isBlank()) {
                assignRoleToUser(userId, roleName);
            }
            return userId;
        }

        throw new RuntimeException("User created but could not retrieve assigned ID");
    }

    @SuppressWarnings("unchecked")
    public void assignRoleToUser(String userId, String roleName) {
        String token = getAdminAccessToken();
        String getRoleUrl = String.format("%s/admin/realms/%s/roles/%s", serverUrl, realm, roleName);

        Map<String, Object> roleObj = restClient.get()
                .uri(getRoleUrl)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(Map.class);

        if (roleObj != null) {
            String assignRoleUrl = String.format("%s/admin/realms/%s/users/%s/role-mappings/realm", serverUrl, realm, userId);
            restClient.post()
                    .uri(assignRoleUrl)
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(List.of(roleObj))
                    .retrieve()
                    .toBodilessEntity();
        }
    }
}
