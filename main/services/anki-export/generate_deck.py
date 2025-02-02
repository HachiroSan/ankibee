import sys
import json
import os
import traceback
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

try:
    import genanki
except ImportError as e:
    logger.error(f"Failed to import genanki: {e}")
    logger.error(f"Python path: {sys.path}")
    logger.error(f"Current working directory: {os.getcwd()}")
    print(json.dumps({
        "success": False,
        "error": f"Failed to import genanki: {str(e)}"
    }))
    sys.exit(1)

def validate_card(card: dict, index: int) -> bool:
    """Validate card data"""
    required_fields = ['word', 'definition', 'audioFileName']
    for field in required_fields:
        if not card.get(field):
            logger.error(f"Card {index}: Missing required field '{field}'")
            return False
        if not isinstance(card[field], str):
            logger.error(f"Card {index}: Field '{field}' must be a string")
            return False
        if not card[field].strip():
            logger.error(f"Card {index}: Field '{field}' is empty")
            return False
    return True

def create_spelling_model() -> genanki.Model:
    return genanki.Model(
        1607392319,
        'Spelling Bee Model',
        fields=[
            {'name': 'Audio'},
            {'name': 'Word'},
            {'name': 'Definition'},
            {'name': 'Notes'},
        ],
        templates=[{
            'name': 'Spelling Bee Card',
            'qfmt': '''
                <div class="spelling-card">
                    <div class="audio-section">
                        {{Audio}}
                    </div>

                    <div class="typing-section">
                        {{type:Word}}
                    </div>
                    
                    <button onclick="showhide()" class="hint-button">
                        Show Definition
                    </button>
                    
                    <div id="definition-content" class="showhide" style="display:none">
                        <div class="definition-box">
                            <div class="definition-text">{{Definition}}</div>
                            {{#Notes}}
                            <div class="notes-text">Note: {{Notes}}</div>
                            {{/Notes}}
                        </div>
                    </div>
                </div>

                <style>
                .spelling-card {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    padding: 1rem;
                    max-width: 100%;
                    margin: 0 auto;
                    text-align: center;
                }

                .audio-section {
                    margin: 1.5rem 0;
                }

                .audio-section audio {
                    width: 100%;
                    max-width: 300px;
                }

                .typing-section {
                    margin: 1.5rem 0;
                }

                .typing-section input {
                    width: 100%;
                    max-width: 300px;
                    padding: 0.8rem;
                    font-size: 1.2rem;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    text-align: center;
                    margin: 0 auto;
                    display: block;
                }

                .typing-section input.typeGood {
                    background-color: #e8f5e9;
                    border-color: #4caf50;
                    color: #2e7d32;
                }

                .typing-section input.typeBad {
                    background-color: #ffebee;
                    border-color: #ef5350;
                    color: #c62828;
                }

                .hint-button {
                    background: #4A90E2;
                    color: white;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    margin: 1rem 0;
                    -webkit-tap-highlight-color: transparent;
                }

                .definition-box {
                    background: #f5f5f5;
                    border-radius: 8px;
                    padding: 1rem;
                    margin: 1rem 0;
                    text-align: left;
                }

                .definition-text {
                    color: #333;
                    line-height: 1.4;
                    margin-bottom: 0.5rem;
                }

                .notes-text {
                    color: #666;
                    font-style: italic;
                    font-size: 0.9em;
                    line-height: 1.4;
                    margin-top: 0.5rem;
                    padding-top: 0.5rem;
                    border-top: 1px solid #ddd;
                }

                /* Dark theme support */
                @media (prefers-color-scheme: dark) {
                    .spelling-card {
                        background: #1a1a1a;
                        color: #fff;
                    }

                    .definition-box {
                        background: #333;
                    }

                    .definition-text {
                        color: #fff;
                    }

                    .notes-text {
                        color: #aaa;
                        border-top-color: #444;
                    }

                    .typing-section input {
                        background: #333;
                        border-color: #444;
                        color: #fff;
                    }

                    .typing-section input.typeGood {
                        background-color: #1b5e20;
                        border-color: #4caf50;
                        color: #fff;
                    }

                    .typing-section input.typeBad {
                        background-color: #b71c1c;
                        border-color: #ef5350;
                        color: #fff;
                    }

                    .hint-button {
                        background: #64B5F6;
                    }
                }

                /* Mobile optimizations */
                @media (max-width: 480px) {
                    .spelling-card {
                        padding: 0.5rem;
                    }

                    .hint-button {
                        padding: 1rem 2rem;
                        width: 100%;
                        max-width: 300px;
                    }

                    .typing-section input {
                        font-size: 1rem;
                        padding: 0.6rem;
                    }
                }
                </style>

                <script>
                // Auto-focus the input field when the card is shown
                document.addEventListener('DOMContentLoaded', function() {
                    var input = document.querySelector('.typing-section input');
                    if (input) {
                        input.focus();
                    }
                });

                function showhide() {
                    var definitionDiv = document.getElementById('definition-content');
                    var button = document.querySelector('.hint-button');
                    
                    if (definitionDiv.style.display === 'none') {
                        definitionDiv.style.display = 'block';
                        button.textContent = 'Hide Definition';
                    } else {
                        definitionDiv.style.display = 'none';
                        button.textContent = 'Show Definition';
                    }
                }

                // Show/hide definition with F2 key
                document.addEventListener('keydown', function(evt) {
                    if (evt.keyCode === 113) { // F2 key
                        showhide();
                    }
                });
                </script>
            ''',
            'afmt': '''
                {{FrontSide}}
            ''',
        }]
    )

def create_deck(deck_name: str, cards: list, media_files: list, output_path: str) -> None:
    """
    Create an Anki deck from the provided cards and media files
    """
    try:
        logger.info(f"Creating deck: {deck_name}")
        logger.info(f"Number of cards: {len(cards)}")
        logger.info(f"Number of media files: {len(media_files)}")
        logger.info(f"Media files: {media_files}")
        
        # Validate cards
        valid_cards = []
        for i, card in enumerate(cards):
            logger.debug(f"Validating card {i+1}: {json.dumps(card, indent=2)}")
            if validate_card(card, i+1):
                valid_cards.append(card)
            else:
                logger.warning(f"Skipping invalid card {i+1}")

        if not valid_cards:
            raise ValueError("No valid cards found in input data")

        logger.info(f"Valid cards: {len(valid_cards)} out of {len(cards)}")
        
        model = create_spelling_model()
        deck = genanki.Deck(2059400110, deck_name)
        
        for i, card in enumerate(valid_cards):
            try:
                # Create note for each card
                audio_tag = f'[sound:{card["audioFileName"]}]'
                fields = [
                    audio_tag,
                    card['word'],
                    card['definition'],
                    card.get('notes', ''),
                ]
                logger.debug(f"Creating note {i+1} with fields: {fields}")
                logger.debug(f"Audio tag: {audio_tag}")
                
                note = genanki.Note(
                    model=model,
                    fields=fields
                )
                deck.add_note(note)
                logger.debug(f"Added card {i+1}: {card['word']}")
            except Exception as e:
                logger.error(f"Failed to add card {i+1}: {e}")
                logger.error(f"Card data: {json.dumps(card, indent=2)}")
                raise
        
        if len(deck.notes) == 0:
            raise ValueError("No notes were added to the deck")
        
        # Create and save the package
        package = genanki.Package(deck)
        package.media_files = media_files
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        logger.info(f"Writing package to: {output_path}")
        logger.info(f"Number of notes in deck: {len(deck.notes)}")
        logger.info(f"Media files to include: {media_files}")
        
        package.write_to_file(output_path)
        logger.info("Package written successfully")
        
    except Exception as e:
        logger.error(f"Failed to create deck: {e}")
        logger.error(traceback.format_exc())
        raise

def main():
    """
    Main function that reads input from stdin and generates the Anki deck
    """
    try:
        logger.info("Starting Anki deck generation")
        
        # Read input from stdin
        input_data = sys.stdin.read()
        logger.debug(f"Received input data: {input_data}")
        
        data = json.loads(input_data)
        
        # Extract data
        deck_name = data['deckName']
        cards = data['cards']
        media_files = data.get('mediaFiles', [])
        output_path = data['outputPath']
        
        # Create the deck
        create_deck(deck_name, cards, media_files, output_path)
        
        # Return success
        result = {
            "success": True,
            "outputPath": output_path
        }
        logger.info("Successfully completed deck generation")
        print(json.dumps(result))
        
    except Exception as e:
        logger.error(f"Failed to generate deck: {e}")
        logger.error(traceback.format_exc())
        # Return error
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main() 