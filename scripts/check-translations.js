#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );

// 读取所有语言文件
const languages = [ 'en', 'zh', 'th', 'my', 'vi' ];
const messagesDir = path.join( __dirname, '../frontend/messages' );

const translations = {};
languages.forEach( lang => {
    const filePath = path.join( messagesDir, `${ lang }.json` );
    translations[ lang ] = JSON.parse( fs.readFileSync( filePath, 'utf8' ) );
} );

// 收集所有使用的翻译键
const usedKeys = new Set();

// 从代码中提取翻译键
const codePatterns = [
    /t\(['"]([^'"]+)['"]/g,           // t('key')
    /tCommon\(['"]([^'"]+)['"]/g,     // tCommon('key')
];

function extractKeysFromFile( filePath ) {
    const content = fs.readFileSync( filePath, 'utf8' );
    codePatterns.forEach( pattern => {
        let match;
        while ( ( match = pattern.exec( content ) ) !== null ) {
            usedKeys.add( match[ 1 ] );
        }
    } );
}

function scanDirectory( dir ) {
    const files = fs.readdirSync( dir );
    files.forEach( file => {
        const filePath = path.join( dir, file );
        const stat = fs.statSync( filePath );
        if ( stat.isDirectory() ) {
            scanDirectory( filePath );
        } else if ( file.endsWith( '.tsx' ) || file.endsWith( '.ts' ) ) {
            extractKeysFromFile( filePath );
        }
    } );
}

// 扫描目录
const appDir = path.join( __dirname, '../frontend/app' );
const componentsDir = path.join( __dirname, '../frontend/components' );
scanDirectory( appDir );
scanDirectory( componentsDir );

console.log( '🔍 已扫描的翻译键数量:', usedKeys.size );
console.log( '\n📋 使用的翻译键列表:' );
console.log( Array.from( usedKeys ).sort().join( '\n' ) );

// 检查每个语言文件
console.log( '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' );
console.log( '🔎 检查各语言文件的翻译键完整性:\n' );

// 收集所有嵌套键
function getAllKeys( obj, prefix = '' ) {
    const keys = [];
    for ( const key in obj ) {
        const fullKey = prefix ? `${ prefix }.${ key }` : key;
        if ( typeof obj[ key ] === 'object' && !Array.isArray( obj[ key ] ) ) {
            keys.push( ...getAllKeys( obj[ key ], fullKey ) );
        } else {
            keys.push( fullKey );
        }
    }
    return keys;
}

// 为每个语言检查
languages.forEach( lang => {
    console.log( `\n📖 ${ lang.toUpperCase() } (${ lang === 'en' ? 'English' : lang === 'zh' ? '中文' : lang === 'th' ? 'ไทย' : lang === 'my' ? 'Melayu' : 'Tiếng Việt' }):` );

    const allKeys = getAllKeys( translations[ lang ] );
    console.log( `   ✅ 总键值数: ${ allKeys.length }` );

    // 检查缺失的键（与英文对比）
    if ( lang !== 'en' ) {
        const enKeys = getAllKeys( translations.en );
        const missing = enKeys.filter( key => !allKeys.includes( key ) );

        if ( missing.length > 0 ) {
            console.log( `   ⚠️  缺失 ${ missing.length } 个键值:` );
            missing.forEach( key => console.log( `      - ${ key }` ) );
        } else {
            console.log( '   ✅ 所有键值完整' );
        }
    }
} );

// 检查代码中使用但字典中缺失的键
console.log( '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' );
console.log( '🔍 检查代码中使用但可能缺失的翻译键:\n' );

const allEnKeys = getAllKeys( translations.en );
const missingInDict = Array.from( usedKeys ).filter( key => {
    // 检查是否存在于任何命名空间
    const parts = key.split( '.' );
    if ( parts.length === 1 ) {
        // 单层键，检查 common 命名空间
        return !allEnKeys.includes( `common.${ key }` );
    }
    return !allEnKeys.includes( key );
} );

if ( missingInDict.length > 0 ) {
    console.log( `⚠️  发现 ${ missingInDict.length } 个可能缺失的键:\n` );
    missingInDict.forEach( key => console.log( `   - ${ key }` ) );
    console.log( '\n💡 建议: 请将这些键添加到语言文件中' );
} else {
    console.log( '✅ 所有使用的键都已在字典中定义' );
}

console.log( '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' );
console.log( '📊 统计摘要:\n' );
console.log( `   使用的翻译键: ${ usedKeys.size }` );
console.log( `   英文字典键值: ${ getAllKeys( translations.en ).length }` );
languages.forEach( lang => {
    if ( lang !== 'en' ) {
        console.log( `   ${ lang.toUpperCase() } 字典键值: ${ getAllKeys( translations[ lang ] ).length }` );
    }
} );

console.log( '\n✅ 检查完成!\n' );
