const fontColors = [
  {
    color: '#fff',
    label: 'Белый',
    hasBorder: true,
  },
  {
    color: '#949494',
    label: 'Серый',
  },
  {
    color: '#515151',
    label: 'Тёмно серый',
  },
  {
    color: '#0b0b0b',
    label: 'Чёрный',
  },
  {
    color: '#00aaFF',
    label: 'Фирменный циан',
  },
  {
    color: '#9BDDFC',
    label: 'Фирменный циан 40%',
  },
  {
    color: '#E5F6FF',
    label: 'Фирменный циан 20%',
    hasBorder: true,
  },
  {
    color: '#002882',
    label: 'Фирменный синий',
  },
  {
    color: '#33539B',
    label: 'Фирменный синий 80%',
  },
  {
    color: '#667EB4',
    label: 'Фирменный синий 60%',
  },
  {
    color: '#99A9CD',
    label: 'Фирменный синий 40%',
  },
  {
    color: '#CCD4E6',
    label: 'Фирменный синий 20%',
    hasBorder: true,
  },
  {
    color: '#78B497',
    label: 'Зелёный',
  },
  {
    color: '#D6E08D',
    label: 'Светло-зелёный',
  },
  {
    color: '#F1CC56',
    label: 'Жёлтый',
  },
  {
    color: '#EA6B50',
    label: 'Коралловый',
  },
  {
    color: '#E62632',
    label: 'Красный',
  },
];
const staticConfigPart = {
  toolbar: {
    items: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'highlight',
      'lineHeight',
      'fontFamily',
      'fontSize',
      'fontColor',
      'fontBackgroundColor',
      'alignment',
      'maxWidth',
      'link',
      'bulletedList',
      'numberedList',
      'blockQuote',
      'insertTable',
      'imageUpload',
      'videoUpload',
      'undo',
      'redo',
    ],
  },
  heading: {
    options: [
      {
        model: 'heading2',
        view: { name: 'h2', classes: 'banner-header' },
        title: 'Заголовок баннера',
        class: 'ck-heading_banner-header',
      },
      {
        model: 'paragraph1',
        view: { name: 'p', classes: 'banner-text' },
        title: 'Текст баннера',
        class: 'ck-heading_banner-text',
      },
    ],
  },
  highlight: {
    options: [
      {
        model: 'cyanogenMarker',
        class: 'marker-cyanogen',
        title: 'Фирменный циан',
        color: '#00aaFF',
        type: 'marker',
      },
      {
        model: 'blueMarker',
        class: 'marker-blue',
        title: 'Фирменный синий',
        color: '#002882',
        type: 'marker',
      },
    ],
  },
  image: {
    styles: ['alignLeft', 'alignRight', 'alignCenter'],
    toolbar: ['imageStyle:alignLeft', 'imageStyle:alignRight', 'imageStyle:alignCenter', '|', 'imageTextAlternative'],
    upload: {
      types: ['jpeg', 'png', 'gif', 'bmp', 'svg+xml'],
    },
  },
  video: {
    styles: ['alignLeft', 'alignRight', 'alignCenter'],
    toolbar: ['videoStyle:alignLeft', 'videoStyle:alignRight', 'videoStyle:alignCenter', '|', 'videoTextAlternative'],
    upload: {
      types: ['mpeg', '3gp', 'mp4', 'ogg', 'quicktime'],
    },
  },
  table: {
    contentToolbar: [
      'tableColumn',
      'tableRow',
      'mergeTableCells',
      'tableBorder',
      'tableAlignment',
      'cellTextAlignment',
    ],
  },
  fontFamily: {
    options: [
      'VTB Group Light',
      'VTB Group Light Oblique',
      'VTB Group Cond Light',
      'VTB Group Book',
      'VTB Group Book Oblique',
      'VTB Group Cond Book',
      'VTB Group Demi Bold',
      'VTB Group Demi Bold Oblique',
      'VTB Group Cond Demi Bold',
      'VTB Group Bold',
      'VTB Group Bold Oblique',
      'VTB Group Cond Bold',
      'VTB Group Extra Bold',
      'VTB Group Extra Bold Oblique',
      'VTB Group Cond Extra Bold',
      'Roboto',
      'Roboto-Medium',
    ],
  },
  fontSize: {
    options: Array.from({ length: 25 }, (_, i) => 8 + 2 * i),
  },
  fontColor: {
    colors: fontColors,
  },
  fontBackgroundColor: {
    colors: fontColors,
  },
  file: {
    videoUploadHandler: async (file, progressEvent) => {
      const { name, type } = file;
      const reader = new FileReader();

      const buffer = await new Promise(resolve => {
        reader.onload = e => resolve(e.target.result);
        reader.readAsArrayBuffer(file.slice());
      });

      const formData = new FormData();
      formData.append('uh', new Blob([buffer], { type }), name);

      const total = 100;
      let loaded = 0;

      return new Promise(resolve => {
        const int = setInterval(() => {
          loaded += 20;
          progressEvent({ total, loaded });
        }, 900);
        setTimeout(() => {
          clearInterval(int);

          resolve('/assets/video.mp4');
        }, 5000);
      });
    },
  },
};

window.templateBlocks = [
  {
    label: '1',
    properties: ['attorney_agreed'],
    selector: 'app-text-block',
    descriptors: [
      {
        name: 'properties',
        label: 'Поля',
        type: Array,
        toString: value => (value || []).join(','),
        toJSON: value => (value || []).split(','),
      },
    ],
  },
  {
    label: '2',
    properties: ['advertisement_agreed'],
    selector: 'app-checkbox-block',
    descriptors: [
      {
        name: 'properties',
        label: 'Поля',
        type: Array,
        toString: value => (value || []).join(','),
        toJSON: value => (value || []).split(','),
      },
    ],
  },
  {
    label: 'ФИО',
    properties: ['full_name'],
    selector: 'app-text-block',
    descriptors: [
      {
        name: 'properties',
        label: 'Поля',
        type: Array,
        toString: value => (value || []).join(','),
        toJSON: value => (value || []).split(','),
      },
    ],
  },
  {
    label: 'Адрес',
    properties: ['address'],
    selector: 'app-text-block',
    descriptors: [
      {
        name: 'properties',
        label: 'Поля',
        type: Array,
        toString: value => (value || []).join(','),
        toJSON: value => (value || []).split(','),
      },
    ],
  },
  {
    label: 'Документ',
    properties: ['identification_type'],
    selector: 'app-select-block',
    descriptors: [
      {
        name: 'properties',
        label: 'Поля',
        type: Array,
        toString: value => (value || []).join(','),
        toJSON: value => (value || []).split(','),
      },
      {
        name: 'options',
        label: 'Документы',
        type: Array,
        toString: value => (value || []).join(','),
        toJSON: value => (value || []).split(','),
      },
    ],
  },
  {
    label: 'Дата выдачи документа',
    properties: ['identification_issue_date'],
    selector: 'app-date-block',
    descriptors: [
      {
        name: 'properties',
        label: 'Поля',
        type: Array,
        toString: value => (value || []).join(','),
        toJSON: value => (value || []).split(','),
      },
    ],
  },
  {
    label: 'Орган, выдавший документ',
    properties: ['identification_authority_name'],
    selector: 'app-text-block',
    descriptors: [
      {
        name: 'properties',
        label: 'Поля',
        type: Array,
        toString: value => (value || []).join(','),
        toJSON: value => (value || []).split(','),
      },
    ],
  },
  {
    label: 'Код подразделения',
    properties: ['identification_authority_number'],
    selector: 'app-number-block',
    descriptors: [
      {
        name: 'properties',
        label: 'Поля',
        type: Array,
        toString: value => (value || []).join(','),
        toJSON: value => (value || []).split(','),
      },
    ],
  },
];

export default {
  ...staticConfigPart,
  stencil: {
    blocks: window.templateBlocks,
    createBlock: (block, parent) => {
      const { component, properties, selector } = block || {};
      const el = document.createElement(selector);

      if (selector === 'app-select-block') {
        const select = document.createElement('select');
        ['Паспорт', 'Права'].forEach(value => {
          const option = document.createElement('option');
          option.textContent = value;
          option.value = value;

          select.appendChild(option);
        });

        el.appendChild(select);
      } else if (selector === 'app-checkbox-block') {
        const input = document.createElement('input');
        input.setAttribute('type', 'checkbox');

        el.appendChild(input);
      } else {
        const span = document.createElement('span');
        span.textContent = 'SOME text BIG or small';
        span.style.minWidth = '120px';
        span.style.width = '100%';
        span.style.fontSize = '14px';
        span.style.border = 'none';
        span.style.borderBottom = '1px solid';
        span.style.lineHeight = '1';

        el.appendChild(span);
      }

      parent.appendChild(el);
    },
  },
  language: 'ru',
  link: {
    fileIconStyles: {
      fontColor: '#0000ee',
    },
    fileIcons: {
      docx: 'far fa-file-word',
      doc: 'far fa-file-word',
      rtf: 'far fa-file-word',
      xlsx: 'far fa-file-excel',
      xls: 'far fa-file-excel',
      pdf: 'far fa-file-pdf',
      jpeg: 'far fa-file-image',
      jpg: 'far fa-file-image',
      png: 'far fa-file-image',
      tiff: 'far fa-file-image',
      tif: 'far fa-file-image',
      bpm: 'far fa-file-image',
      csv: 'far fa-file-csv',
      default: 'far fa-file',
    },
    extensions: [
      '.bpm',
      '.csv',
      '.doc',
      '.docx',
      '.jpeg',
      '.jpg',
      '.pdf',
      '.rtf',
      '.png',
      '.tif',
      '.tiff',
      '.txt',
      '.xls',
      '.xlsx',
      '.xml',
    ],
    uploadHandler() {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve('https://ya.ru');
        }, 100);
      });
    },
  },
};
