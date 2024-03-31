package freeuni.macs.macscode;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class ExecutorApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldPassAddTests() throws Exception {
        this.mockMvc.perform(post("/submission")
                .contentType(MediaType.APPLICATION_JSON)
                .content(fromFile("request.json")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(3)))
                .andExpect(jsonPath("$[0].result", is("Pass")))
                .andExpect(jsonPath("$[1].result", is("Pass")))
                .andExpect(jsonPath("$[2].result", is("Fail")));
    }

    private byte[] fromFile(String fileName) throws IOException {
        String path = "src/test/java/freeuni/macs/macscode/" + fileName;
        File file = new File(path);
        return Files.readAllBytes(Path.of(file.getAbsolutePath()));
    }

}
