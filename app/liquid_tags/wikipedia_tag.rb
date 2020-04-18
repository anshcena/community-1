class WikipediaTag < LiquidTagBase
  PARTIAL = "liquids/wikipedia".freeze

  def initialize(tag_name, input, tokens)
    super
    @data = get_data(input.strip)
  end

  def render(_context)
    ActionController::Base.new.render_to_string(
      partial: PARTIAL,
      locals: {
        title: @data[:title],
        extract: @data[:extract],
        url: @data[:url]
      },
    )
  end

  private

  def valid_url?(input)
    input.match?(%r{^https?://([a-z-]+)\.wikipedia.org/wiki/([\S]+)$})
  end

  def get_data(input)
    url = ActionController::Base.helpers.strip_tags(input).strip
    raise StandardError, "Invalid Wikipedia share URL" unless valid_url?(url)

    uri = URI.parse(url)
    lang = uri.host.split(".", 2).first
    title = uri.path.split("/").last
    anchor = uri.fragment

    if anchor
      parse_page_with_anchor(url, lang, title, anchor)
    else
      parse_page(url, lang, title)
    end
  end

  def parse_page_with_anchor(url, lang, title, anchor)
    response = HTTParty.get("https://#{lang}.wikipedia.org/api/rest_v1/page/mobile-sections/#{title}", format: :json)
    handle_response_error(response, url)

    text, section_title = get_section_contents(response, anchor, url)
    title = "#{response['lead']['normalizedtitle']} - #{section_title}"

    {
      title: title,
      url: url,
      extract: text_clean_up(text)
    }
  end

  def parse_page(url, lang, title)
    response = HTTParty.get("https://#{lang}.wikipedia.org/api/rest_v1/page/summary/#{title}", format: :json)
    handle_response_error(response, url)

    {
      title: response["title"],
      url: url,
      extract: response["extract"]
    }
  end

  def handle_response_error(response, input)
    return if response.code == 200

    raise StandardError, "Couldn't find the Wikipedia article {% #{tag_name} #{input} %}: #{response['detail']}"
  end

  def get_section_contents(response, anchor, input)
    text = title = ""
    response["remaining"]["sections"].each do |section|
      if section["anchor"] == CGI.unescape(anchor)
        text = section["text"]
        title = section["line"]
      end
    end

    return [text, title] if title.present?

    raise StandardError, "Couldn't find the section of the Wikipedia article {% #{tag_name} #{input} %}"
  end

  def text_clean_up(text)
    doc = Nokogiri::HTML(text)
    path_expression = "//div[contains(@class, 'noprint') or contains(@class, 'hatnote')] |
                      //span[@class='mw-ref'] |
                      //figure |
                      //sup"
    doc.xpath(path_expression).each(&:remove)
    doc.xpath("//a").each { |x| x.replace Nokogiri::XML::Text.new(x.inner_html, x.document) }
    doc.to_html
  end
end

Liquid::Template.register_tag("wikipedia", WikipediaTag)
