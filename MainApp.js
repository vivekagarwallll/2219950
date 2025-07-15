import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container,
} from "@mui/material";

function customLogger(action, payload) {
  console.log(`[UNIQ_LOG] Action: ${action}`, payload);
}

function createUniqueCode(existingCodes) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  do {
    code = Array.from({ length: 6 }, () =>
      characters[Math.floor(Math.random() * characters.length)]
    ).join("");
  } while (existingCodes.has(code));
  return code;
}

function LinkShortenerPage({ links, setLinks }) {
  const [formData, setFormData] = useState([
    { longUrl: "", validity: 30, customCode: "" },
  ]);

  const handleChange = (index, field, value) => {
    const newFormData = [...formData];
    newFormData[index][field] = value;
    setFormData(newFormData);
  };

  const handleAddField = () => {
    if (formData.length < 5) {
      setFormData([
        ...formData,
        { longUrl: "", validity: 30, customCode: "" },
      ]);
    }
  };

  const handleSubmit = () => {
    const existingCodes = new Set(links.map((item) => item.shortCode));
    const newLinks = formData
      .map((entry) => {
        if (!entry.longUrl.startsWith("http")) {
          alert("Invalid URL format");
          return null;
        }
        let shortCode =
          entry.customCode || createUniqueCode(existingCodes);
        existingCodes.add(shortCode);
        return {
          ...entry,
          shortCode,
          createdAt: new Date().toISOString(),
          expiry: new Date(
            Date.now() + entry.validity * 60000
          ).toISOString(),
          clicks: [],
        };
      })
      .filter(Boolean);

    setLinks([...links, ...newLinks]);
    customLogger("Links Shortened", newLinks);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Link Shortener
      </Typography>
      {formData.map((data, i) => (
        <div key={i}>
          <TextField
            label="Long URL"
            value={data.longUrl}
            onChange={(e) =>
              handleChange(i, "longUrl", e.target.value)
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Validity (minutes)"
            type="number"
            value={data.validity}
            onChange={(e) =>
              handleChange(i, "validity", e.target.value)
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Custom Shortcode (optional)"
            value={data.customCode}
            onChange={(e) =>
              handleChange(i, "customCode", e.target.value)
            }
            fullWidth
            margin="normal"
          />
        </div>
      ))}
      <Button
        variant="contained"
        onClick={handleAddField}
        disabled={formData.length >= 5}
      >
        Add Another URL
      </Button>
      <Button
        variant="contained"
        onClick={handleSubmit}
        sx={{ ml: 2 }}
      >
        Shorten
      </Button>
      <Button
        variant="outlined"
        href="/stats"
        sx={{ ml: 2 }}
      >
        View Stats
      </Button>
    </Container>
  );
}

function LinkStatisticsPage({ links }) {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Link Statistics
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Short Code</TableCell>
            <TableCell>Original URL</TableCell>
            <TableCell>Expiry</TableCell>
            <TableCell>Clicks</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {links.map((link, i) => (
            <TableRow key={i}>
              <TableCell>{link.shortCode}</TableCell>
              <TableCell>{link.longUrl}</TableCell>
              <TableCell>
                {new Date(link.expiry).toLocaleString()}
              </TableCell>
              <TableCell>{link.clicks.length}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

function RedirectComponent({ links }) {
  const navigate = useNavigate();
  const { pathname } = window.location;

  useEffect(() => {
    const shortcode = pathname.replace("/", "");
    const match = links.find((item) => item.shortCode === shortcode);
    if (match) {
      customLogger("Redirect", { shortcode });
      window.location.href = match.longUrl;
    } else {
      navigate("/");
    }
  }, [links, pathname, navigate]);

  return null;
}

function MainApp() {
  const [links, setLinks] = useState([]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <LinkShortenerPage links={links} setLinks={setLinks} />
          }
        />
        <Route
          path="/stats"
          element={<LinkStatisticsPage links={links} />}
        />
        <Route
          path="*"
          element={<RedirectComponent links={links} />}
        />
      </Routes>
    </Router>
  );
}

export default MainApp;
