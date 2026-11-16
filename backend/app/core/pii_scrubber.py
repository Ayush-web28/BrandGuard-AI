import re
from typing import Tuple, Dict

class PIIScrubberService:
    def __init__(self):
        # Regex patterns for sensitive internal data
        self.email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
        self.phone_pattern = r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'
        self.api_key_pattern = r'\b(?:sk-[a-zA-Z0-9]{20,}|AIza[0-9A-Za-z-_]{35}|ghp_[a-zA-Z0-9]{36})\b'
        self.internal_ip_pattern = r'\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3})\b'

    def scrub(self, text: str) -> Tuple[str, Dict[str, int]]:
        counts = {"emails": 0, "phones": 0, "api_keys": 0, "internal_ips": 0}

        def scrub_email(m):
            counts["emails"] += 1
            return "[REDACTED_EMAIL]"

        def scrub_phone(m):
            counts["phones"] += 1
            return "[REDACTED_PHONE]"

        def scrub_key(m):
            counts["api_keys"] += 1
            return "[REDACTED_API_KEY]"

        def scrub_ip(m):
            counts["internal_ips"] += 1
            return "[REDACTED_INTERNAL_IP]"

        scrubbed = re.sub(self.api_key_pattern, scrub_key, text)
        scrubbed = re.sub(self.email_pattern, scrub_email, scrubbed)
        scrubbed = re.sub(self.phone_pattern, scrub_phone, scrubbed)
        scrubbed = re.sub(self.internal_ip_pattern, scrub_ip, scrubbed)

        return scrubbed, counts

pii_scrubber_service = PIIScrubberService()
