import React from 'react';

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|[a-zA-Z0-9]+\.(com|org|net|edu|gov|io|co|us|uk|de|fr|au|jp|cn|in|br|ca|mx|es|it|nl|se|no|fi|dk|ru|pl|be|at|ch|nz|sg|hk|kr|tw|za|ar|cl|my|th|id|vn|ph|pk|eg|ng|ke|gh|tn|ma|dz|et|ug|cm|ci|sn|zw|bw|mz|mg|zm|na|mw|rw|so|sd|ly|ao|gn|bf|ml|ne|td|ss|lr|sl|tg|bj|cf|gm|gw|gq|st|cv|km|sc|mu|re|yt|mq|gp|pm|bl|mf|sx|cw|aw|tc|vg|ai|ms|fk|gs|sh|tk|nu|nf|cx|cc|pn|tv|ws|as|gu|mp|pw|fm|mh|ki|nr|to|vu|sb|fj|pg|nc|pf|wf|tf|aq|bv|hm|sj|io|ac|ad|ae|af|ag|al|am|ao|ar|at|au|aw|ax|az|ba|bb|bd|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bw|by|bz|cd|cf|cg|ci|ck|cl|cm|co|cr|cu|cv|cw|cy|cz|dj|dk|dm|do|dz|ec|ee|eg|er|et|fi|fj|fk|fm|fo|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gt|gu|gw|gy|hk|hn|hr|ht|hu|id|ie|il|im|in|iq|ir|is|je|jm|jo|kg|kh|kn|kp|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|mc|md|me|mg|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|mz|na|nc|ne|nf|ng|ni|no|np|nr|nu|om|pa|pe|pf|pg|ph|pk|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|rw|sa|sb|sc|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|ss|st|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tr|tt|tv|tz|ua|ug|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|zm|zw)\b)/gi;

export function linkifyText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  const regex = new RegExp(URL_REGEX);

  while ((match = regex.exec(text)) !== null) {
    const url = match[0];
    const index = match.index;

    if (index > lastIndex) {
      parts.push(text.substring(lastIndex, index));
    }

    let href = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      href = 'https://' + url;
    }

    parts.push(
      <a
        key={`link-${index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-slate-600 dark:text-white/90 underline hover:text-slate-800 dark:hover:text-white transition"
        onClick={(e) => e.stopPropagation()}
      >
        {url}
      </a>
    );

    lastIndex = index + url.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
