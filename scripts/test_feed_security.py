"""Offline feed URL security regression tests (no network access)."""
import ipaddress
import pathlib
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import build_news_feed as feed


def public_dns(*args, **kwargs):
    return [(2, 1, 6, "", ("8.8.8.8", 443))]


class FeedSecurityTests(unittest.TestCase):
    def test_public_https_allowed(self):
        with patch.object(feed.socket, "getaddrinfo", side_effect=public_dns):
            self.assertEqual(feed.validate_feed_destination("https://example.org/rss"), "https://example.org/rss")

    def test_reject_private_and_loopback(self):
        for ip in ("127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.2.1", "169.254.169.254", "::1", "fc00::1"):
            with self.subTest(ip=ip):
                with patch.object(feed.socket, "getaddrinfo", return_value=[(2, 1, 6, "", (ip, 443))]):
                    with self.assertRaises(ValueError):
                        feed.validate_feed_destination("https://example.org/rss")

    def test_reject_disallowed_scheme_and_port(self):
        for url in ("http://example.org/feed", "https://localhost/", "https://example.org:8443/rss"):
            with self.subTest(url=url):
                with self.assertRaises(ValueError):
                    feed.validate_feed_destination(url)

    def test_reject_redirect_to_private_host(self):
        handler = feed.ValidatingRedirectHandler()
        with patch.object(feed.socket, "getaddrinfo", return_value=[(2, 1, 6, "", ("127.0.0.1", 443))]):
            with self.assertRaises(ValueError):
                handler.redirect_request(None, None, 302, "Found", {}, "https://example.org/internal")

    def test_reject_credentials(self):
        with self.assertRaises(ValueError):
            feed.validate_feed_destination("https://user:secret@example.org/feed")


if __name__ == "__main__":
    unittest.main()
